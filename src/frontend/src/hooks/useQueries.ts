import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
import type { Product, OrderItem, CustomerDetails, OrderInfo, UserProfile, UserRole } from '../backend';

const ADMIN_CHECK_TIMEOUT = 8000; // 8 seconds

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

export function useHasAnyAdmin() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  const isActorReady = !!actor && !actorFetching;

  return useQuery<boolean>({
    queryKey: ['hasAnyAdmin'],
    queryFn: async () => {
      if (!actor) {
        throw new Error('Actor not initialized');
      }

      // Create a timeout promise
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(new Error('hasAnyAdmin check timed out after 8 seconds'));
        }, ADMIN_CHECK_TIMEOUT);
      });

      try {
        // Use type assertion to check if method exists at runtime
        const actorAny = actor as any;
        if (typeof actorAny.hasAnyAdmin === 'function') {
          const result = await Promise.race([actorAny.hasAnyAdmin(), timeoutPromise]);
          console.log('hasAnyAdmin result:', result);
          return result;
        }
        
        console.error('hasAnyAdmin method not found on actor');
        throw new Error('Backend interface mismatch: hasAnyAdmin method not available');
      } catch (error: any) {
        console.error('hasAnyAdmin check error:', error);
        throw error;
      }
    },
    enabled: isActorReady && !!identity,
    retry: 1,
    staleTime: 30000, // Cache for 30 seconds
  });
}

export function useClaimInitialAdmin() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not initialized');
      
      // Use type assertion to check if method exists at runtime
      const actorAny = actor as any;
      if (typeof actorAny.claimInitialAdmin !== 'function') {
        throw new Error('Backend interface mismatch: claimInitialAdmin method not available');
      }

      await actorAny.claimInitialAdmin();
    },
    onSuccess: () => {
      // Invalidate all admin-related queries to refresh state
      queryClient.invalidateQueries({ queryKey: ['isAdmin'] });
      queryClient.invalidateQueries({ queryKey: ['hasAnyAdmin'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}

export function useIsCallerAdmin() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  // Include principal in query key to prevent stale cached results across identity changes
  const principalString = identity?.getPrincipal().toString() || 'anonymous';

  // Derive actor ready state from available properties
  const isActorReady = !!actor && !actorFetching;

  const query = useQuery<boolean>({
    queryKey: ['isAdmin', principalString],
    queryFn: async () => {
      if (!actor) {
        throw new Error('Actor not initialized');
      }
      
      // If no identity, we're anonymous - return false without calling backend
      if (!identity) {
        return false;
      }

      // Create a timeout promise to prevent indefinite hanging
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(new Error('Admin check timed out after 8 seconds. The backend may be unresponsive or the method may not be available.'));
        }, ADMIN_CHECK_TIMEOUT);
      });

      // Create the admin check promise
      const adminCheckPromise = (async () => {
        try {
          // Primary method: Try isCallerAdmin() if available
          if (typeof actor.isCallerAdmin === 'function') {
            const result = await actor.isCallerAdmin();
            console.log('Admin check (isCallerAdmin) for principal', principalString, ':', result);
            return result;
          }

          // Fallback method: Use getCallerUserRole() to check if role is 'admin'
          if (typeof actor.getCallerUserRole === 'function') {
            console.log('isCallerAdmin not available, falling back to getCallerUserRole');
            const role = await actor.getCallerUserRole();
            const isAdmin = role === 'admin';
            console.log('Admin check (getCallerUserRole) for principal', principalString, ':', role, '-> isAdmin:', isAdmin);
            return isAdmin;
          }

          // If neither method is available, throw an error
          console.error('Neither isCallerAdmin nor getCallerUserRole methods found on actor. Available methods:', Object.keys(actor));
          throw new Error('Backend interface mismatch: Admin check methods not available. The canister may need to be redeployed.');
        } catch (error: any) {
          console.error('Admin check error:', error);
          
          // Map common authorization failures to false (access denied) rather than error state
          const errorMessage = error?.message || String(error);
          
          // These are expected "not admin" responses - return false
          if (
            errorMessage.includes('Unauthorized') ||
            errorMessage.includes('not have permission') ||
            errorMessage.includes('Access denied') ||
            errorMessage.includes('not authorized')
          ) {
            console.log('Authorization denied - treating as non-admin');
            return false;
          }
          
          // For other errors (timeouts, interface mismatches, etc.), propagate them
          throw error;
        }
      })();

      // Race the admin check against the timeout
      return await Promise.race([adminCheckPromise, timeoutPromise]);
    },
    enabled: isActorReady && !!identity,
    retry: false,
    staleTime: 30000, // Cache for 30 seconds
  });

  return {
    ...query,
    isActorReady,
  };
}

export function useGetAllOrders() {
  const { actor, isFetching } = useActor();

  return useQuery<OrderInfo[]>({
    queryKey: ['orders'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not initialized');
      try {
        return await actor.getAllOrders();
      } catch (error: any) {
        const errorMessage = error?.message || String(error);
        if (
          errorMessage.includes('Unauthorized') ||
          errorMessage.includes('not have permission') ||
          errorMessage.includes('Access denied')
        ) {
          throw new Error('UNAUTHORIZED');
        }
        throw error;
      }
    },
    enabled: !!actor && !isFetching,
  });
}

export function useImportProducts() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      products: Array<{
        name: string;
        brand: string;
        category: string;
        price: bigint;
        imageUrl?: string;
        description?: string;
      }>
    ) => {
      if (!actor) throw new Error('Actor not initialized');
      try {
        await actor.importProducts(products);
      } catch (error: any) {
        const errorMessage = error?.message || String(error);
        if (
          errorMessage.includes('Unauthorized') ||
          errorMessage.includes('not have permission') ||
          errorMessage.includes('Access denied')
        ) {
          throw new Error('UNAUTHORIZED: Only admins can import products');
        }
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
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
