import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  FileText,
  Plus,
  CheckCircle,
  XCircle,
  Clock,
  ShoppingCart,
  Calendar,
  User,
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { toast } from 'sonner';

interface Proposal {
  id: string;
  title: string;
  authors: string;
  type: 'book' | 'periodic' | 'thesis' | 'report';
  publisher?: string;
  year: number;
  estimatedPrice?: number;
  currency?: string;
  justification: string;
  status: 'pending' | 'approved' | 'rejected' | 'ordered';
  submittedBy: string;
  submittedAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
  comments?: string;
}

const mockProposals: Proposal[] = [
  {
    id: 'p1',
    title: 'Designing Data-Intensive Applications',
    authors: 'Martin Kleppmann',
    type: 'book',
    publisher: "O'Reilly Media",
    year: 2017,
    estimatedPrice: 45,
    currency: 'EUR',
    justification: 'Essential reading for understanding modern distributed systems architecture.',
    status: 'approved',
    submittedBy: 'user@ecl.fr',
    submittedAt: '2024-12-01',
    reviewedBy: 'manager@ecl.fr',
    reviewedAt: '2024-12-05',
    comments: 'Approved for LIRIS lab collection.',
  },
  {
    id: 'p2',
    title: 'Introduction to Quantum Computing',
    authors: 'Michael Nielsen, Isaac Chuang',
    type: 'book',
    publisher: 'Cambridge University Press',
    year: 2010,
    estimatedPrice: 65,
    currency: 'EUR',
    justification: 'Need for upcoming quantum computing research project.',
    status: 'pending',
    submittedBy: 'user@ecl.fr',
    submittedAt: '2024-12-15',
  },
  {
    id: 'p3',
    title: 'Neural Network Methods for Natural Language Processing',
    authors: 'Yoav Goldberg',
    type: 'book',
    publisher: 'Morgan & Claypool',
    year: 2017,
    estimatedPrice: 55,
    currency: 'EUR',
    justification: 'Required for NLP course curriculum.',
    status: 'rejected',
    submittedBy: 'manager@ecl.fr',
    submittedAt: '2024-11-20',
    reviewedBy: 'admin@ecl.fr',
    reviewedAt: '2024-11-25',
    comments: 'Already available in ICJ lab.',
  },
];

export default function Proposals() {
  const { user } = useAuthStore();
  const [proposals, setProposals] = useState<Proposal[]>(mockProposals);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    authors: '',
    type: 'book',
    publisher: '',
    year: new Date().getFullYear(),
    estimatedPrice: '',
    justification: '',
  });

  const canManage = user?.role === 'admin' || user?.role === 'lab_manager';

  const statusConfig = {
    pending: { icon: Clock, variant: 'warning' as const, label: 'Pending Review' },
    approved: { icon: CheckCircle, variant: 'success' as const, label: 'Approved' },
    rejected: { icon: XCircle, variant: 'destructive' as const, label: 'Rejected' },
    ordered: { icon: ShoppingCart, variant: 'info' as const, label: 'Ordered' },
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newProposal: Proposal = {
      id: `p${Date.now()}`,
      title: formData.title,
      authors: formData.authors,
      type: formData.type as Proposal['type'],
      publisher: formData.publisher || undefined,
      year: Number(formData.year),
      estimatedPrice: formData.estimatedPrice ? Number(formData.estimatedPrice) : undefined,
      currency: 'EUR',
      justification: formData.justification,
      status: 'pending',
      submittedBy: user?.email || '',
      submittedAt: new Date().toISOString().split('T')[0],
    };

    setProposals([newProposal, ...proposals]);
    setIsDialogOpen(false);
    setFormData({
      title: '',
      authors: '',
      type: 'book',
      publisher: '',
      year: new Date().getFullYear(),
      estimatedPrice: '',
      justification: '',
    });
    toast.success('Proposal submitted successfully!');
  };

  const handleStatusChange = (proposalId: string, newStatus: Proposal['status']) => {
    setProposals((prev) =>
      prev.map((p) =>
        p.id === proposalId
          ? { ...p, status: newStatus, reviewedBy: user?.email, reviewedAt: new Date().toISOString().split('T')[0] }
          : p
      )
    );
    toast.success(`Proposal ${newStatus}`);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Proposals</h1>
          <p className="text-muted-foreground mt-1">
            Suggest new publications for the library collection
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Proposal
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Propose New Publication</DialogTitle>
              <DialogDescription>
                Submit a request for a new book or publication to be added to the library.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Publication title"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="authors">Author(s) *</Label>
                  <Input
                    id="authors"
                    value={formData.authors}
                    onChange={(e) => setFormData({ ...formData, authors: e.target.value })}
                    placeholder="Author names"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">Type *</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => setFormData({ ...formData, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="book">Book</SelectItem>
                      <SelectItem value="periodic">Periodic</SelectItem>
                      <SelectItem value="thesis">Thesis</SelectItem>
                      <SelectItem value="report">Report</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="publisher">Publisher</Label>
                  <Input
                    id="publisher"
                    value={formData.publisher}
                    onChange={(e) => setFormData({ ...formData, publisher: e.target.value })}
                    placeholder="Publisher name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="year">Year *</Label>
                  <Input
                    id="year"
                    type="number"
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: Number(e.target.value) })}
                    min={1900}
                    max={new Date().getFullYear() + 1}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">Estimated Price (EUR)</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.estimatedPrice}
                  onChange={(e) => setFormData({ ...formData, estimatedPrice: e.target.value })}
                  placeholder="0.00"
                  min={0}
                  step={0.01}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="justification">Justification *</Label>
                <Textarea
                  id="justification"
                  value={formData.justification}
                  onChange={(e) => setFormData({ ...formData, justification: e.target.value })}
                  placeholder="Why should this publication be added to the library?"
                  rows={3}
                  required
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Submit Proposal</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {Object.entries(statusConfig).map(([status, config]) => {
          const count = proposals.filter((p) => p.status === status).length;
          const Icon = config.icon;

          return (
            <Card key={status}>
              <CardContent className="p-4 flex items-center gap-4">
                <div className={`w-10 h-10 rounded-lg bg-${config.variant}/10 flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 text-${config.variant}`} />
                </div>
                <div>
                  <p className="text-xl font-bold font-display">{count}</p>
                  <p className="text-sm text-muted-foreground">{config.label}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Proposals List */}
      <div className="space-y-4">
        {proposals.map((proposal, index) => {
          const StatusIcon = statusConfig[proposal.status].icon;

          return (
            <Card
              key={proposal.id}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                        <FileText className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-foreground">{proposal.title}</h3>
                          <Badge variant={proposal.type as any}>{proposal.type}</Badge>
                          <Badge variant={statusConfig[proposal.status].variant}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {statusConfig[proposal.status].label}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          by {proposal.authors}
                          {proposal.publisher && ` • ${proposal.publisher}`}
                          {proposal.year && ` • ${proposal.year}`}
                        </p>
                      </div>
                    </div>

                    <p className="text-sm text-foreground/80 pl-13">{proposal.justification}</p>

                    <div className="flex items-center gap-4 text-xs text-muted-foreground pl-13">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {proposal.submittedBy}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(proposal.submittedAt)}
                      </span>
                      {proposal.estimatedPrice && (
                        <span>Est. {proposal.estimatedPrice} {proposal.currency}</span>
                      )}
                    </div>

                    {proposal.comments && (
                      <div className="pl-13 p-3 rounded-lg bg-muted/50 text-sm">
                        <p className="text-muted-foreground">
                          <span className="font-medium text-foreground">Review:</span> {proposal.comments}
                        </p>
                        {proposal.reviewedBy && (
                          <p className="text-xs text-muted-foreground mt-1">
                            — {proposal.reviewedBy}, {formatDate(proposal.reviewedAt!)}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions for managers/admins */}
                  {canManage && proposal.status === 'pending' && (
                    <div className="flex gap-2 flex-shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-destructive border-destructive/30 hover:bg-destructive/10"
                        onClick={() => handleStatusChange(proposal.id, 'rejected')}
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        Reject
                      </Button>
                      <Button
                        size="sm"
                        variant="success"
                        onClick={() => handleStatusChange(proposal.id, 'approved')}
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Approve
                      </Button>
                    </div>
                  )}

                  {canManage && proposal.status === 'approved' && (
                    <Button
                      size="sm"
                      onClick={() => handleStatusChange(proposal.id, 'ordered')}
                    >
                      <ShoppingCart className="w-4 h-4 mr-1" />
                      Mark as Ordered
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
