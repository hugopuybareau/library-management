import { useAuthStore } from '@/stores/authStore';
import { useBorrowings, useReturnMutation } from '@/api/queries/useBorrowings';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  BookMarked,
  Calendar,
  Clock,
  ArrowUpDown,
  RotateCcw,
  AlertTriangle,
  Loader2,
} from 'lucide-react';

export default function Borrowings() {
  const { user } = useAuthStore();
  const { data: borrowings = [], isLoading, error } = useBorrowings();
  const returnMutation = useReturnMutation();

  const activeBorrowings = borrowings.filter((b) => !b.returnDate);
  const pastBorrowings = borrowings.filter((b) => b.returnDate);

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

  const handleReturn = (borrowingId: number) => {
    returnMutation.mutate(borrowingId);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading borrowings...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <BookMarked className="w-12 h-12 text-destructive mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-foreground mb-2">Failed to load borrowings</h3>
          <p className="text-muted-foreground">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-display font-bold text-foreground">My Borrowings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your borrowed publications and view your borrowing history
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-info/10 flex items-center justify-center">
              <BookMarked className="w-6 h-6 text-info" />
            </div>
            <div>
              <p className="text-2xl font-bold font-display">{activeBorrowings.length}</p>
              <p className="text-sm text-muted-foreground">Active Borrowings</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center">
              <Clock className="w-6 h-6 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold font-display">
                {activeBorrowings.filter((b) => getDaysUntilDue(b.dueDate) <= 3 && getDaysUntilDue(b.dueDate) >= 0).length}
              </p>
              <p className="text-sm text-muted-foreground">Due Soon</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-destructive" />
            </div>
            <div>
              <p className="text-2xl font-bold font-display">
                {activeBorrowings.filter((b) => getDaysUntilDue(b.dueDate) < 0).length}
              </p>
              <p className="text-sm text-muted-foreground">Overdue</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Borrowings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookMarked className="w-5 h-5" />
            Active Borrowings
          </CardTitle>
        </CardHeader>
        <CardContent>
          {activeBorrowings.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Publication</TableHead>
                  <TableHead>Lab</TableHead>
                  <TableHead>
                    <div className="flex items-center gap-1">
                      Borrowed
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </TableHead>
                  <TableHead>
                    <div className="flex items-center gap-1">
                      Due Date
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activeBorrowings.map((borrowing) => {
                  const daysUntilDue = getDaysUntilDue(borrowing.dueDate);
                  const isOverdue = daysUntilDue < 0;
                  const isDueSoon = daysUntilDue <= 3 && daysUntilDue >= 0;

                  return (
                    <TableRow key={borrowing.id}>
                      <TableCell className="font-medium max-w-[300px] truncate">
                        {borrowing.publicationTitle}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{borrowing.labName}</Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(borrowing.borrowDate)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          {formatDate(borrowing.dueDate)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={isOverdue ? 'destructive' : isDueSoon ? 'warning' : 'success'}
                        >
                          {isOverdue
                            ? `${Math.abs(daysUntilDue)} days overdue`
                            : `${daysUntilDue} days left`}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          onClick={() => handleReturn(Number(borrowing.id))}
                          disabled={returnMutation.isPending}
                        >
                          {returnMutation.isPending ? (
                            <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                          ) : (
                            <RotateCcw className="w-3 h-3 mr-1" />
                          )}
                          Return
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12">
              <BookMarked className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No active borrowings</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Borrowing History */}
      {pastBorrowings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Borrowing History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Publication</TableHead>
                  <TableHead>Lab</TableHead>
                  <TableHead>Borrowed</TableHead>
                  <TableHead>Returned</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pastBorrowings.map((borrowing) => (
                  <TableRow key={borrowing.id}>
                    <TableCell className="font-medium max-w-[300px] truncate">
                      {borrowing.publicationTitle}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{borrowing.labName}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(borrowing.borrowDate)}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {borrowing.returnDate ? formatDate(borrowing.returnDate) : '-'}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">Returned</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
