import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, BookOpen, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { Navigate } from 'react-router-dom';
import { useLabs } from '@/api/queries/useLabs';
import { useMemo } from 'react';

interface Lab {
  id_lab: number;
  name: string;
  department?: string;
  total_copies: number;
  available_copies: number;
}

export default function Labs() {
  const { user } = useAuthStore();
  const { data: labsData, isLoading, error } = useLabs();

  if (user?.role !== 'admin' && user?.role !== 'lab_manager') {
    return <Navigate to="/dashboard" replace />;
  }

  const labs: Lab[] = useMemo(() => labsData || [], [labsData]);

  const accessibleLabs = useMemo(() => {
    if (user?.role === 'admin') return labs;
    return labs.filter(l => user?.labAccess.includes(l.name));
  }, [user, labs]);

  // Loading state
  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading labs...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Building2 className="w-12 h-12 text-destructive mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-foreground mb-2">Failed to load labs</h3>
          <p className="text-muted-foreground">{(error as Error).message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-display font-bold text-foreground">Labs Management</h1>
        <p className="text-muted-foreground mt-1">Manage research laboratories and their collections</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {accessibleLabs.map((lab, index) => (
          <Card key={lab.id_lab} className="hover:border-primary/30 transition-all animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">{lab.name}</CardTitle>
                  {lab.department && (
                    <p className="text-xs text-muted-foreground truncate max-w-[200px]">{lab.department}</p>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="p-2 rounded-lg bg-muted/50">
                  <BookOpen className="w-4 h-4 mx-auto text-muted-foreground mb-1" />
                  <p className="text-lg font-bold">{lab.total_copies || 0}</p>
                  <p className="text-xs text-muted-foreground">Total Copies</p>
                </div>
                <div className="p-2 rounded-lg bg-success/10">
                  <BookOpen className="w-4 h-4 mx-auto text-success mb-1" />
                  <p className="text-lg font-bold text-success">{lab.available_copies || 0}</p>
                  <p className="text-xs text-muted-foreground">Available</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
