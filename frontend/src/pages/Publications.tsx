import { useState, useMemo } from 'react';
import { useLibraryStore, Publication } from '@/stores/libraryStore';
import { useAuthStore } from '@/stores/authStore';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  BookOpen,
  Search,
  Grid3X3,
  List,
  Filter,
  X,
  Calendar,
  Building2,
  User,
  BookMarked,
} from 'lucide-react';
import { toast } from 'sonner';

export default function Publications() {
  const { publications, searchQuery, setSearchQuery, filters, setFilters, resetFilters } =
    useLibraryStore();
  const { user } = useAuthStore();

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);

  const publicationTypes = ['book', 'periodic', 'thesis', 'report'];
  const labs = ['LIRIS', 'AMPERE', 'LTDS', 'ICJ', 'LMFA'];

  const filteredPublications = useMemo(() => {
    return publications.filter((pub) => {
      // Search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = pub.title.toLowerCase().includes(query);
        const matchesAuthors = pub.authors.some((a) => a.toLowerCase().includes(query));
        const matchesISBN = pub.isbn?.toLowerCase().includes(query);
        const matchesKeywords = pub.keywords.some((k) => k.toLowerCase().includes(query));
        if (!matchesTitle && !matchesAuthors && !matchesISBN && !matchesKeywords) {
          return false;
        }
      }

      // Type filter
      if (filters.type.length > 0 && !filters.type.includes(pub.type)) {
        return false;
      }

      // Lab filter
      if (filters.lab.length > 0) {
        const pubLabs = pub.copies.map((c) => c.labName);
        if (!filters.lab.some((l) => pubLabs.includes(l))) {
          return false;
        }
      }

      // Availability filter
      if (filters.availability.length > 0) {
        const hasAvailable = pub.copies.some((c) => c.status === 'on_rack');
        if (filters.availability.includes('available') && !hasAvailable) {
          return false;
        }
        if (filters.availability.includes('borrowed') && hasAvailable) {
          return false;
        }
      }

      return true;
    });
  }, [publications, searchQuery, filters]);

  const handleBorrow = (publication: Publication) => {
    const availableCopy = publication.copies.find(
      (c) => c.status === 'on_rack' && user?.labAccess.includes(c.labName)
    );

    if (!availableCopy) {
      toast.error('No available copies from your accessible labs');
      return;
    }

    toast.success(`Successfully borrowed "${publication.title}" from ${availableCopy.labName}`);
  };

  const getAvailability = (publication: Publication) => {
    const available = publication.copies.filter((c) => c.status === 'on_rack').length;
    const total = publication.copies.length;
    return { available, total };
  };

  const hasActiveFilters = filters.type.length > 0 || filters.lab.length > 0 || filters.availability.length > 0;

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Publications</h1>
          <p className="text-muted-foreground mt-1">
            Browse and borrow from our collection of {publications.length} publications
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={showFilters ? 'secondary' : 'outline'}
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters
            {hasActiveFilters && (
              <span className="ml-2 w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                {filters.type.length + filters.lab.length + filters.availability.length}
              </span>
            )}
          </Button>

          <div className="flex border border-border rounded-lg overflow-hidden">
            <Button
              variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
              size="icon-sm"
              onClick={() => setViewMode('grid')}
              className="rounded-none"
            >
              <Grid3X3 className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'secondary' : 'ghost'}
              size="icon-sm"
              onClick={() => setViewMode('list')}
              className="rounded-none"
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-2xl">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          placeholder="Search by title, author, ISBN, or keywords..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 h-12 text-base bg-secondary/50"
        />
        {searchQuery && (
          <Button
            variant="ghost"
            size="icon-sm"
            className="absolute right-2 top-1/2 -translate-y-1/2"
            onClick={() => setSearchQuery('')}
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <Card className="animate-fade-in">
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Type</label>
                <Select
                  value={filters.type[0] || ''}
                  onValueChange={(value) =>
                    setFilters({ type: value ? [value] : [] })
                  }
                >
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="All types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All types</SelectItem>
                    {publicationTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Lab</label>
                <Select
                  value={filters.lab[0] || ''}
                  onValueChange={(value) =>
                    setFilters({ lab: value ? [value] : [] })
                  }
                >
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="All labs" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All labs</SelectItem>
                    {labs.map((lab) => (
                      <SelectItem key={lab} value={lab}>
                        {lab}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Availability</label>
                <Select
                  value={filters.availability[0] || ''}
                  onValueChange={(value) =>
                    setFilters({ availability: value ? [value] : [] })
                  }
                >
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Any status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Any status</SelectItem>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="borrowed">All borrowed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {hasActiveFilters && (
                <div className="flex items-end">
                  <Button variant="ghost" size="sm" onClick={resetFilters}>
                    <X className="w-4 h-4 mr-1" />
                    Clear filters
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results count */}
      <p className="text-sm text-muted-foreground">
        Showing {filteredPublications.length} of {publications.length} publications
      </p>

      {/* Publications Grid/List */}
      {filteredPublications.length > 0 ? (
        <div
          className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
              : 'space-y-3'
          }
        >
          {filteredPublications.map((publication, index) => {
            const { available, total } = getAvailability(publication);
            const canBorrow =
              available > 0 &&
              publication.copies.some(
                (c) => c.status === 'on_rack' && user?.labAccess.includes(c.labName)
              );

            if (viewMode === 'grid') {
              return (
                <Card
                  key={publication.id}
                  className="group hover:border-primary/30 transition-all duration-200 animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <CardContent className="p-4 space-y-4">
                    {/* Book cover placeholder */}
                    <div className="aspect-[3/4] rounded-lg bg-gradient-to-br from-secondary to-muted flex items-center justify-center overflow-hidden">
                      <BookOpen className="w-12 h-12 text-muted-foreground/50" />
                    </div>

                    {/* Content */}
                    <div className="space-y-2">
                      <Badge variant={publication.type as any} className="text-xs">
                        {publication.type}
                      </Badge>

                      <h3 className="font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                        {publication.title}
                      </h3>

                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {publication.authors.join(', ') || 'Various Authors'}
                      </p>

                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        {publication.year}
                        {publication.publisher && (
                          <>
                            <span>•</span>
                            {publication.publisher}
                          </>
                        )}
                      </div>

                      {/* Availability */}
                      <div className="flex items-center gap-2 pt-2">
                        <Badge variant={available > 0 ? 'success' : 'destructive'}>
                          {available}/{total} available
                        </Badge>
                      </div>

                      {/* Labs */}
                      <div className="flex flex-wrap gap-1">
                        {publication.copies.map((copy) => (
                          <span
                            key={copy.copyId}
                            className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground"
                          >
                            {copy.labName}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        Details
                      </Button>
                      <Button
                        size="sm"
                        className="flex-1"
                        disabled={!canBorrow}
                        onClick={() => handleBorrow(publication)}
                      >
                        <BookMarked className="w-4 h-4 mr-1" />
                        Borrow
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            }

            // List view
            return (
              <Card
                key={publication.id}
                className="hover:border-primary/30 transition-all duration-200 animate-slide-in-right"
                style={{ animationDelay: `${index * 30}ms` }}
              >
                <CardContent className="p-4 flex items-start gap-4">
                  {/* Cover */}
                  <div className="w-16 h-24 rounded bg-gradient-to-br from-secondary to-muted flex items-center justify-center flex-shrink-0">
                    <BookOpen className="w-6 h-6 text-muted-foreground/50" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant={publication.type as any} className="text-xs">
                            {publication.type}
                          </Badge>
                          <Badge variant={available > 0 ? 'success' : 'destructive'}>
                            {available}/{total} available
                          </Badge>
                        </div>
                        <h3 className="font-semibold text-foreground mt-1 truncate">
                          {publication.title}
                        </h3>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {publication.authors.join(', ') || 'Various Authors'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {publication.year}
                      </span>
                      {publication.publisher && (
                        <span>{publication.publisher}</span>
                      )}
                    </div>

                    <div className="flex items-center gap-1 flex-wrap">
                      <Building2 className="w-3 h-3 text-muted-foreground" />
                      {publication.copies.map((copy) => (
                        <span
                          key={copy.copyId}
                          className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground"
                        >
                          {copy.labName}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      Details
                    </Button>
                    <Button size="sm" disabled={!canBorrow} onClick={() => handleBorrow(publication)}>
                      <BookMarked className="w-4 h-4 mr-1" />
                      Borrow
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16">
          <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-display font-semibold text-foreground mb-2">
            No publications found
          </h3>
          <p className="text-muted-foreground mb-4">
            Try adjusting your search or filters
          </p>
          <Button variant="outline" onClick={resetFilters}>
            Clear all filters
          </Button>
        </div>
      )}
    </div>
  );
}
