import { createClient } from '@supabase/supabase-js';
import { Session } from '@shopify/shopify-api';
import type { SessionStorage } from '@shopify/shopify-api';

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export class SupabaseSessionStorage implements SessionStorage {
  async storeSession(session: Session): Promise<boolean> {
    try {
      const sessionData = {
        id: session.id,
        shop: session.shop,
        state: session.state,
        isOnline: session.isOnline,
        scope: session.scope,
        expires: session.expires,
        accessToken: session.accessToken,
        userId: session.userId ? BigInt(session.userId) : null,
        firstName: session.firstName,
        lastName: session.lastName,
        email: session.email,
        accountOwner: session.accountOwner,
        locale: session.locale,
        collaborator: session.collaborator,
        emailVerified: session.emailVerified,
      };

      const { error } = await supabase
        .from('shopify_sessions')
        .upsert(sessionData, { onConflict: 'id' });

      if (error) {
        console.error('Error storing session:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error storing session:', error);
      return false;
    }
  }

  async loadSession(id: string): Promise<Session | undefined> {
    try {
      const { data, error } = await supabase
        .from('shopify_sessions')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !data) {
        return undefined;
      }

      // Convert back to Session object
      const session = new Session({
        id: data.id,
        shop: data.shop,
        state: data.state,
        isOnline: data.isOnline,
        scope: data.scope,
        expires: data.expires ? new Date(data.expires) : undefined,
        accessToken: data.accessToken,
        userId: data.userId ? data.userId.toString() : undefined,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        accountOwner: data.accountOwner,
        locale: data.locale,
        collaborator: data.collaborator,
        emailVerified: data.emailVerified,
      });

      return session;
    } catch (error) {
      console.error('Error loading session:', error);
      return undefined;
    }
  }

  async deleteSession(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('shopify_sessions')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting session:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error deleting session:', error);
      return false;
    }
  }

  async deleteSessions(ids: string[]): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('shopify_sessions')
        .delete()
        .in('id', ids);

      if (error) {
        console.error('Error deleting sessions:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error deleting sessions:', error);
      return false;
    }
  }

  async findSessionsByShop(shop: string): Promise<Session[]> {
    try {
      const { data, error } = await supabase
        .from('shopify_sessions')
        .select('*')
        .eq('shop', shop);

      if (error || !data) {
        return [];
      }

      return data.map(sessionData => new Session({
        id: sessionData.id,
        shop: sessionData.shop,
        state: sessionData.state,
        isOnline: sessionData.isOnline,
        scope: sessionData.scope,
        expires: sessionData.expires ? new Date(sessionData.expires) : undefined,
        accessToken: sessionData.accessToken,
        userId: sessionData.userId ? sessionData.userId.toString() : undefined,
        firstName: sessionData.firstName,
        lastName: sessionData.lastName,
        email: sessionData.email,
        accountOwner: sessionData.accountOwner,
        locale: sessionData.locale,
        collaborator: sessionData.collaborator,
        emailVerified: sessionData.emailVerified,
      }));
    } catch (error) {
      console.error('Error finding sessions by shop:', error);
      return [];
    }
  }
}
