import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
import type { Product, OrderItem, CustomerDetails, OrderInfo, UserProfile } from '../backend';

export function useGetAllProducts() {
  const { actor, isFetching } = useActor();

  return useQuery<Product[]>({
    queryKey: ['products'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.getAllProducts();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetProduct(productId: bigint | null) {
  const { actor, isFetching } = useActor();

  return useQuery<Product | null>({
    queryKey: ['product', productId?.toString()],
    queryFn: async () => {
      if (!actor || !productId) return null;
      try {
        return await actor.getProduct(productId);
      } catch (error) {
        console.error('Error fetching product:', error);
        return null;
      }
    },
    enabled: !!actor && !isFetching && productId !== null,
  });
}

export function useSubmitInquiry() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ name, contact, message }: { name: string; contact: string; message: string }) => {
      if (!actor) throw new Error('Actor not initialized');
      await actor.submitInquiry(name, contact, message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inquiries'] });
    },
  });
}

export function usePlaceOrder() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ customerDetails, items }: { customerDetails: CustomerDetails; items: OrderItem[] }) => {
      if (!actor) throw new Error('Actor not initialized');
      return await actor.placeOrder(customerDetails, items);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}

export function useIsCallerAdmin() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  // Include principal in query key to prevent stale cached results across identity changes
  const principalString = identity?.getPrincipal().toString() || 'anonymous';

  return useQuery<boolean>({
    queryKey: ['isAdmin', principalString],
    queryFn: async () => {
      if (!actor) return false;
      try {
        return await actor.isCallerAdmin();
      } catch (error) {
        return false;
      }
    },
    enabled: !!actor && !isFetching && !!identity,
    retry: false,
    staleTime: 0, // Always refetch to ensure fresh admin status
  });
}

export function useGetAllOrders() {
  const { actor, isFetching } = useActor();

  return useQuery<OrderInfo[]>({
    queryKey: ['orders'],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getAllOrders();
      } catch (error) {
        console.error('Error fetching orders:', error);
        return [];
      }
    },
    enabled: !!actor && !isFetching,
    retry: false,
  });
}

export function useImportProducts() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (products: Array<{
      name: string;
      brand: string;
      category: string;
      price: bigint;
      imageUrl?: string;
      description?: string;
    }>) => {
      if (!actor) throw new Error('Actor not initialized');
      await actor.importProducts(products);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile', identity?.getPrincipal().toString() || 'anonymous'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching && !!identity,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not initialized');
      await actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}
