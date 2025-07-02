import useSWR from "swr";

export default function useUser() {
  const { data, error, isLoading } = useSWR(`/api/user-profile`);

  return {
    user: data,
    isLoading,
    isError: error,
  };
}
