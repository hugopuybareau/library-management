import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Building2, BookOpen, Users, DollarSign, ArrowRight } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { Navigate } from 'react-router-dom';

const labs = [
  { id: 'LIRIS', name: 'LIRIS', fullName: 'Laboratoire d\'InfoRmatique en Image et Systèmes', publications: 45, users: 12, value: 4500 },
  { id: 'AMPERE', name: 'AMPERE', fullName: 'Laboratoire Ampère', publications: 38, users: 8, value: 3800 },
  { id: 'LTDS', name: 'LTDS', fullName: 'Laboratoire de Tribologie et Dynamique des Systèmes', publications: 29, users: 6, value: 2900 },
  { id: 'ICJ', name: 'ICJ', fullName: 'Institut Camille Jordan', publications: 52, users: 15, value: 5200 },
  { id: 'LMFA', name: 'LMFA', fullName: 'Laboratoire de Mécanique des Fluides et d\'Acoustique', publications: 34, users: 9, value: 3400 },
];

export default function Labs() {
  const { user } = useAuthStore();

  if (user?.role !== 'admin' && user?.role !== 'lab_manager') {
    return <Navigate to="/dashboard" replace />;
  }

  const accessibleLabs = user?.role === 'admin' ? labs : labs.filter(l => user?.labAccess.includes(l.id));

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-display font-bold text-foreground">Labs Management</h1>
        <p className="text-muted-foreground mt-1">Manage research laboratories and their collections</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {accessibleLabs.map((lab, index) => (
          <Card key={lab.id} className="hover:border-primary/30 transition-all animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">{lab.name}</CardTitle>
                  <p className="text-xs text-muted-foreground truncate max-w-[200px]">{lab.fullName}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2 rounded-lg bg-muted/50">
                  <BookOpen className="w-4 h-4 mx-auto text-muted-foreground mb-1" />
                  <p className="text-lg font-bold">{lab.publications}</p>
                  <p className="text-xs text-muted-foreground">Books</p>
                </div>
                <div className="p-2 rounded-lg bg-muted/50">
                  <Users className="w-4 h-4 mx-auto text-muted-foreground mb-1" />
                  <p className="text-lg font-bold">{lab.users}</p>
                  <p className="text-xs text-muted-foreground">Users</p>
                </div>
                <div className="p-2 rounded-lg bg-muted/50">
                  <DollarSign className="w-4 h-4 mx-auto text-muted-foreground mb-1" />
                  <p className="text-lg font-bold">€{(lab.value / 1000).toFixed(1)}k</p>
                  <p className="text-xs text-muted-foreground">Value</p>
                </div>
              </div>
              <Button variant="outline" className="w-full">
                View Details <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
