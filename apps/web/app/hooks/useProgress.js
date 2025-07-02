import useSWR from "swr";

export function useGetProgress() {
  const { data, error, isLoading } = useSWR(`/api/progress/get`);

  return {
    progress: data,
    isLoading,
    isError: error,
  };
}
