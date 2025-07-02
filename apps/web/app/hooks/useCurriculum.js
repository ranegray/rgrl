import useSWR from "swr";

export default function useCurriculum() {
  const { data, error, isLoading } = useSWR(`/api/curriculum`);

  return {
    curriculum: data,
    isLoading,
    isError: error,
  };
}
