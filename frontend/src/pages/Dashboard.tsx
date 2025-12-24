import { useAuthStore } from '@/stores/authStore';
import { useLibraryStore } from '@/stores/libraryStore';
import { StatCard } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  BookOpen,
  Users,
  Building2,
  AlertTriangle,
  BookMarked,
  TrendingUp,
  Clock,
  ArrowRight,
  BookX,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { user } = useAuthStore();
  const { publications, borrowings } = useLibraryStore();

  const stats = {
    totalPublications: publications.length,
    totalCopies: publications.reduce((acc, p) => acc + p.copies.length, 0),
    activeBorrowings: borrowings.filter((b) => b.status === 'active').length,
    overdueBorrowings: borrowings.filter((b) => b.status === 'overdue').length,
    lostBooks: publications.reduce(
      (acc, p) => acc + p.copies.filter((c) => c.status === 'lost').length,
      0
    ),
    availableCopies: publications.reduce(
      (acc, p) => acc + p.copies.filter((c) => c.status === 'on_rack').length,
      0
    ),
  };

  const userBorrowings = borrowings.filter((b) => b.userEmail === user?.email);
  const userOverdue = userBorrowings.filter((b) => b.status === 'overdue');

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getDaysUntilDue = (dueDate: string) => {
    const due = new Date(dueDate);
    const today = new Date();
    const diff = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">
            Welcome back, {user?.name?.split(' ')[0]}
          </h1>
          <p className="text-muted-foreground mt-1">
            Here's what's happening in the library today
          </p>
        </div>
        <Button asChild variant="hero" size="lg">
          <Link to="/publications">
            <BookOpen className="w-5 h-5 mr-2" />
            Browse Publications
          </Link>
        </Button>
      </div>

      {/* Alert for overdue books */}
      {userOverdue.length > 0 && (
        <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 flex items-start gap-3 animate-fade-in animation-delay-200">
          <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-semibold text-foreground">Overdue Books Alert</h3>
            <p className="text-sm text-muted-foreground mt-1">
              You have {userOverdue.length} overdue book(s). Please return them as soon as possible to avoid additional fees.
            </p>
          </div>
          <Button variant="destructive" size="sm" asChild>
            <Link to="/borrowings">View Details</Link>
          </Button>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard className="animate-fade-in">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-info/10 flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-info" />
            </div>
            <div>
              <p className="text-2xl font-bold font-display">{stats.totalPublications}</p>
              <p className="text-sm text-muted-foreground">Publications</p>
            </div>
          </div>
        </StatCard>

        <StatCard className="animate-fade-in animation-delay-200">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
              <BookMarked className="w-6 h-6 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold font-display">{stats.availableCopies}</p>
              <p className="text-sm text-muted-foreground">Available Copies</p>
            </div>
          </div>
        </StatCard>

        <StatCard className="animate-fade-in animation-delay-400">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold font-display">{stats.activeBorrowings}</p>
              <p className="text-sm text-muted-foreground">Active Borrowings</p>
            </div>
          </div>
        </StatCard>

        <StatCard className="animate-fade-in animation-delay-600">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center">
              <Clock className="w-6 h-6 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold font-display">{stats.overdueBorrowings}</p>
              <p className="text-sm text-muted-foreground">Overdue</p>
            </div>
          </div>
        </StatCard>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* My Borrowings */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-display font-semibold">My Borrowings</h2>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/borrowings">
                View All <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </Button>
          </div>

          <div className="space-y-3">
            {userBorrowings.length > 0 ? (
              userBorrowings.slice(0, 3).map((borrowing) => {
                const daysUntilDue = getDaysUntilDue(borrowing.dueDate);
                const isOverdue = daysUntilDue < 0;
                const isDueSoon = daysUntilDue <= 3 && daysUntilDue >= 0;

                return (
                  <div
                    key={borrowing.id}
                    className="p-4 rounded-xl bg-card border border-border hover:border-primary/30 transition-all duration-200"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-foreground truncate">
                          {borrowing.publicationTitle}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          From: {borrowing.labName} • Due: {formatDate(borrowing.dueDate)}
                        </p>
                      </div>
                      <Badge
                        variant={
                          isOverdue ? 'destructive' : isDueSoon ? 'warning' : 'success'
                        }
                      >
                        {isOverdue
                          ? `${Math.abs(daysUntilDue)} days overdue`
                          : `${daysUntilDue} days left`}
                      </Badge>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-8 rounded-xl bg-card border border-border text-center">
                <BookMarked className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No active borrowings</p>
                <Button variant="outline" size="sm" className="mt-4" asChild>
                  <Link to="/publications">Browse Publications</Link>
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Quick Stats for Admin/Manager */}
        {(user?.role === 'admin' || user?.role === 'lab_manager') && (
          <div className="space-y-4">
            <h2 className="text-xl font-display font-semibold">System Overview</h2>
            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-card border border-border">
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-muted-foreground" />
                  <span className="text-muted-foreground">Total Users</span>
                  <span className="ml-auto font-semibold">24</span>
                </div>
              </div>
              <div className="p-4 rounded-xl bg-card border border-border">
                <div className="flex items-center gap-3">
                  <Building2 className="w-5 h-5 text-muted-foreground" />
                  <span className="text-muted-foreground">Active Labs</span>
                  <span className="ml-auto font-semibold">5</span>
                </div>
              </div>
              <div className="p-4 rounded-xl bg-card border border-border">
                <div className="flex items-center gap-3">
                  <BookX className="w-5 h-5 text-destructive" />
                  <span className="text-muted-foreground">Lost Books</span>
                  <span className="ml-auto font-semibold text-destructive">{stats.lostBooks}</span>
                </div>
              </div>
            </div>

            <Button variant="outline" className="w-full" asChild>
              <Link to="/reports">
                View Detailed Reports <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>
        )}

        {/* Recommendations for regular users */}
        {user?.role === 'user' && (
          <div className="space-y-4">
            <h2 className="text-xl font-display font-semibold">Recommended for You</h2>
            <div className="space-y-3">
              {publications.slice(0, 3).map((pub) => (
                <Link
                  key={pub.id}
                  to={`/publications/${pub.id}`}
                  className="block p-4 rounded-xl bg-card border border-border hover:border-primary/30 transition-all duration-200"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-14 rounded bg-muted flex items-center justify-center flex-shrink-0">
                      <BookOpen className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-foreground text-sm truncate">{pub.title}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">
                        {pub.authors.join(', ')}
                      </p>
                      <Badge variant={pub.type as any} className="mt-2 text-xs">
                        {pub.type}
                      </Badge>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
