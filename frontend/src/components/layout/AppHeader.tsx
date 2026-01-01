import { LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/authStore';
import { useLogoutMutation } from '@/api/queries/useAuth';

export function AppHeader() {
  const { user } = useAuthStore();
  const logoutMutation = useLogoutMutation();

  return (
    <header className="h-16 border-b border-border bg-background/80 backdrop-blur-md flex items-center px-6 gap-4 sticky top-0 z-50">
      <div className="flex-1" />

      {/* User Info and Logout */}
      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-sm font-medium">{user?.name}</p>
          <p className="text-xs text-muted-foreground">{user?.email}</p>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => logoutMutation.mutate()}
          className="text-muted-foreground hover:text-destructive"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </Button>
      </div>
    </header>
  );
}
