import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import { SearchInput } from '@/components/SearchInput';
import { SearchResults } from '@/components/SearchResults';
import { FollowUpInput } from '@/components/FollowUpInput';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { SourceList } from '@/components/SourceList';
import { saveToHistory } from '@/lib/history';
import { ThemeToggle } from '@/components/ThemeToggle';
import { searchQuery, followUpQuery } from '@/lib/api';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function Search() {
  const [location, setLocation] = useLocation();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [currentResults, setCurrentResults] = useState<any>(null);
  const [originalQuery, setOriginalQuery] = useState<string | null>(null);
  const [isFollowUp, setIsFollowUp] = useState(false);
  const [followUpQuery, setFollowUpQuery] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  
  // Extract query from URL
  const getQueryFromUrl = () => {
    const searchParams = new URLSearchParams(window.location.search);
    return searchParams.get('q') || '';
  };
  
  const [searchTerm, setSearchTerm] = useState(getQueryFromUrl);

  // Reset error when search term changes
  useEffect(() => {
    setApiError(null);
  }, [searchTerm]);

  const { data, isLoading, error } = useQuery({
    queryKey: ['search', searchTerm],
    queryFn: async () => {
      try {
        if (!searchTerm) return null;
        const result = await searchQuery(searchTerm);
        if (result.sessionId) {
          setSessionId(result.sessionId);
          setCurrentResults(result);
          if (!originalQuery) {
            setOriginalQuery(searchTerm);
          }
          setIsFollowUp(false);
          saveToHistory(searchTerm, result.text);
        }
        return result;
      } catch (err) {
        if (err instanceof Error && err.message.includes('API key')) {
          setApiError('Please set your Gemini API key in the settings before searching.');
        } else {
          setApiError((err as Error).message || 'An error occurred while searching');
        }
        throw err;
      }
    },
    enabled: !!searchTerm,
    retry: false,
  });

  // Follow-up mutation
  const followUpMutation = useMutation({
    mutationFn: async (query: string) => {
      try {
        if (!sessionId) throw new Error('No session ID');
        const result = await followUpQuery(sessionId, query);
        setCurrentResults(result);
        saveToHistory(query, result.text);
        return result;
      } catch (err) {
        if (err instanceof Error && err.message.includes('API key')) {
          setApiError('Please set your Gemini API key in the settings before searching.');
        } else {
          setApiError((err as Error).message || 'An error occurred with the follow-up');
        }
        throw err;
      }
    },
  });

  const handleSearch = (query: string) => {
    setSearchTerm(query);
    setApiError(null);
  };

  const handleFollowUp = (query: string) => {
    setFollowUpQuery(query);
    followUpMutation.mutate(query);
  };

  const displayResults = currentResults || data;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation('/')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <ThemeToggle />
        </div>

        {apiError && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{apiError}</AlertDescription>
          </Alert>
        )}

        <div className="flex flex-col items-stretch">
          <SearchInput
            onSearch={handleSearch}
            initialValue={searchTerm}
            isLoading={isLoading}
            autoFocus={false}
            large={false}
          />

          <SearchResults
            query={isFollowUp ? (followUpQuery || '') : searchTerm}
            results={displayResults}
            isLoading={isLoading || followUpMutation.isPending}
            error={error || followUpMutation.error || undefined}
            isFollowUp={isFollowUp}
            originalQuery={originalQuery || ''}
          />

          {displayResults && !isLoading && !followUpMutation.isPending && (
            <div className="mt-6 max-w-2xl">
              <FollowUpInput
                onSubmit={handleFollowUp}
                isLoading={followUpMutation.isPending}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}