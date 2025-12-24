import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  FileBarChart,
  Download,
  BookOpen,
  Users,
  Building2,
  DollarSign,
  BookX,
  Calendar,
  Search,
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { Navigate } from 'react-router-dom';
import { useState } from 'react';
import { toast } from 'sonner';

interface ReportConfig {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  params?: { type: string; label: string; placeholder?: string; options?: string[] }[];
}

const reports: ReportConfig[] = [
  {
    id: 'all-publications',
    title: 'All Publications',
    description: 'Complete list of unique publications across all labs',
    icon: BookOpen,
  },
  {
    id: 'user-borrowings',
    title: 'User Borrowed Books',
    description: 'Books currently borrowed by a specific user',
    icon: Users,
    params: [
      { type: 'text', label: 'User Email', placeholder: 'user@ecl.fr' },
      { type: 'select', label: 'Lab (optional)', options: ['All Labs', 'LIRIS', 'AMPERE', 'LTDS', 'ICJ', 'LMFA'] },
    ],
  },
  {
    id: 'lab-value',
    title: 'Lab Collection Value',
    description: 'Total value of publications owned by a lab in EUR',
    icon: DollarSign,
    params: [
      { type: 'select', label: 'Select Lab', options: ['LIRIS', 'AMPERE', 'LTDS', 'ICJ', 'LMFA'] },
    ],
  },
  {
    id: 'borrow-eligibility',
    title: 'Borrow Eligibility Check',
    description: 'Check if a user can borrow a specific publication',
    icon: Search,
    params: [
      { type: 'text', label: 'User Email', placeholder: 'user@ecl.fr' },
      { type: 'text', label: 'Publication Title or ISBN', placeholder: 'Search...' },
    ],
  },
  {
    id: 'current-borrowers',
    title: 'Current Borrowers Finder',
    description: 'Find who has copies of unavailable publications',
    icon: Users,
    params: [
      { type: 'text', label: 'Publication Title or ISBN', placeholder: 'Search...' },
    ],
  },
  {
    id: 'category-price',
    title: 'Category & Price Filter',
    description: 'Books by category under a specified price',
    icon: DollarSign,
    params: [
      { type: 'select', label: 'Category', options: ['Computer Science', 'AI/ML', 'Software Engineering', 'Mechanical Engineering', 'Mathematics'] },
      { type: 'number', label: 'Max Price (EUR)', placeholder: '50' },
    ],
  },
  {
    id: 'author-year',
    title: 'Author & Year Filter',
    description: 'Publications by author after a specific year',
    icon: Calendar,
    params: [
      { type: 'text', label: 'Author Name', placeholder: 'Enter author name' },
      { type: 'number', label: 'After Year', placeholder: '2020' },
    ],
  },
  {
    id: 'publisher-chronology',
    title: 'Publisher Chronology',
    description: 'Chronological list of books by publisher',
    icon: BookOpen,
    params: [
      { type: 'text', label: 'Publisher Name', placeholder: 'Enter publisher name' },
    ],
  },
  {
    id: 'lost-books',
    title: 'Lost Books Report',
    description: 'All lost books sorted by owner lab and ISBN',
    icon: BookX,
  },
];

export default function Reports() {
  const { user } = useAuthStore();
  const [selectedReport, setSelectedReport] = useState<string | null>(null);
  const [reportParams, setReportParams] = useState<Record<string, string>>({});

  if (user?.role !== 'admin' && user?.role !== 'lab_manager') {
    return <Navigate to="/dashboard" replace />;
  }

  const handleGenerateReport = (reportId: string) => {
    toast.success(`Generating "${reports.find(r => r.id === reportId)?.title}" report...`);
    // In real app, this would call the API and download/display the report
  };

  const selectedReportConfig = reports.find(r => r.id === selectedReport);

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-display font-bold text-foreground">Reports</h1>
        <p className="text-muted-foreground mt-1">
          Generate and download various reports about the library system
        </p>
      </div>

      {/* Report Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {reports.map((report, index) => {
          const Icon = report.icon;
          const isSelected = selectedReport === report.id;

          return (
            <Card
              key={report.id}
              className={`cursor-pointer transition-all duration-200 animate-fade-in ${
                isSelected ? 'ring-2 ring-primary border-primary' : 'hover:border-primary/30'
              }`}
              style={{ animationDelay: `${index * 50}ms` }}
              onClick={() => setSelectedReport(isSelected ? null : report.id)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-base">{report.title}</CardTitle>
                    <CardDescription className="text-xs mt-1">
                      {report.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                {report.params ? (
                  <Badge variant="outline" className="text-xs">
                    {report.params.length} parameter{report.params.length > 1 ? 's' : ''} required
                  </Badge>
                ) : (
                  <Badge variant="success" className="text-xs">
                    Ready to generate
                  </Badge>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Report Configuration Panel */}
      {selectedReportConfig && (
        <Card className="animate-scale-in">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <selectedReportConfig.icon className="w-6 h-6 text-primary" />
              </div>
              <div>
                <CardTitle>{selectedReportConfig.title}</CardTitle>
                <CardDescription>{selectedReportConfig.description}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedReportConfig.params?.map((param, index) => (
              <div key={index} className="space-y-2">
                <Label>{param.label}</Label>
                {param.type === 'select' && param.options ? (
                  <Select
                    value={reportParams[param.label] || ''}
                    onValueChange={(value) =>
                      setReportParams({ ...reportParams, [param.label]: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={`Select ${param.label.toLowerCase()}`} />
                    </SelectTrigger>
                    <SelectContent>
                      {param.options.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    type={param.type}
                    placeholder={param.placeholder}
                    value={reportParams[param.label] || ''}
                    onChange={(e) =>
                      setReportParams({ ...reportParams, [param.label]: e.target.value })
                    }
                  />
                )}
              </div>
            ))}

            <div className="flex gap-3 pt-4">
              <Button onClick={() => handleGenerateReport(selectedReportConfig.id)}>
                <FileBarChart className="w-4 h-4 mr-2" />
                Generate Report
              </Button>
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Download CSV
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Reports */}
      {!selectedReport && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileBarChart className="w-5 h-5" />
              Quick Reports
            </CardTitle>
            <CardDescription>
              Click on any report card above to configure and generate, or use these quick actions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Button
                variant="outline"
                onClick={() => handleGenerateReport('all-publications')}
              >
                <BookOpen className="w-4 h-4 mr-2" />
                All Publications
              </Button>
              <Button
                variant="outline"
                onClick={() => handleGenerateReport('lost-books')}
              >
                <BookX className="w-4 h-4 mr-2" />
                Lost Books
              </Button>
              <Button variant="outline" onClick={() => toast.info('Lab summary coming soon')}>
                <Building2 className="w-4 h-4 mr-2" />
                Lab Summary
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
