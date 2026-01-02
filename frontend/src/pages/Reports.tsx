import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { Navigate } from 'react-router-dom';
import { useState } from 'react';
import {
  useAllPublications,
  useLostBooks,
  useOverdueBorrowings,
  useUserBorrowings,
  useLabValue,
  useByCategoryPrice,
  useByAuthorYear,
  usePublisherChronology,
} from '@/api/queries/useReports';

export default function Reports() {
  const { user } = useAuthStore();

  // Parameters for queries
  const [userEmail, setUserEmail] = useState('');
  const [labId, setLabId] = useState('');
  const [category, setCategory] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [author, setAuthor] = useState('');
  const [year, setYear] = useState('');
  const [publisher, setPublisher] = useState('');

  if (user?.role !== 'admin' && user?.role !== 'lab_manager') {
    return <Navigate to="/dashboard" replace />;
  }

  // Query hooks
  const { data: allPublications, isLoading: loadingPubs } = useAllPublications();
  const { data: userBorrowings, isLoading: loadingUserBorrow } = useUserBorrowings(
    userEmail,
    labId ? parseInt(labId) : undefined
  );
  const { data: labValue, isLoading: loadingLabValue } = useLabValue(
    labId ? parseInt(labId) : 0
  );
  const { data: categoryPriceData, isLoading: loadingCategoryPrice } = useByCategoryPrice(
    category,
    maxPrice ? parseFloat(maxPrice) : 0
  );
  const { data: authorYearData, isLoading: loadingAuthorYear } = useByAuthorYear(
    author,
    year ? parseInt(year) : 0
  );
  const { data: publisherData, isLoading: loadingPublisher } = usePublisherChronology(publisher);
  const { data: lostBooks, isLoading: loadingLost } = useLostBooks();
  const { data: overdueBorrowings, isLoading: loadingOverdue } = useOverdueBorrowings();

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-display font-bold text-foreground">Reports</h1>
        <p className="text-muted-foreground mt-1">
          All 9 required SQL queries for the library system
        </p>
      </div>

      <Tabs defaultValue="q1" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5 lg:grid-cols-9">
          <TabsTrigger value="q1">Q1</TabsTrigger>
          <TabsTrigger value="q2">Q2</TabsTrigger>
          <TabsTrigger value="q3">Q3</TabsTrigger>
          <TabsTrigger value="q4">Q4</TabsTrigger>
          <TabsTrigger value="q5">Q5</TabsTrigger>
          <TabsTrigger value="q6">Q6</TabsTrigger>
          <TabsTrigger value="q7">Q7</TabsTrigger>
          <TabsTrigger value="q8">Q8</TabsTrigger>
          <TabsTrigger value="q9">Q9</TabsTrigger>
        </TabsList>

        {/* Query 1: All Publications */}
        <TabsContent value="q1">
          <Card>
            <CardHeader>
              <CardTitle>Query 1: All Unique Publications</CardTitle>
              <CardDescription>
                Complete list of unique publications across all labs
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingPubs ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="border-b">
                      <tr>
                        <th className="text-left p-2">ID</th>
                        <th className="text-left p-2">Title</th>
                        <th className="text-left p-2">Type</th>
                        <th className="text-left p-2">Year</th>
                        <th className="text-left p-2">Publisher</th>
                        <th className="text-left p-2">Authors</th>
                        <th className="text-left p-2">Identifier</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allPublications?.map((pub: any) => (
                        <tr key={pub.id_publication} className="border-b hover:bg-muted/50">
                          <td className="p-2">{pub.id_publication}</td>
                          <td className="p-2 font-medium">{pub.title}</td>
                          <td className="p-2">
                            <span className="px-2 py-1 rounded-full bg-primary/10 text-primary text-xs">
                              {pub.publication_type}
                            </span>
                          </td>
                          <td className="p-2">{pub.year_publication}</td>
                          <td className="p-2">{pub.publisher_name || 'N/A'}</td>
                          <td className="p-2">{pub.authors || 'Unknown'}</td>
                          <td className="p-2 font-mono text-xs">{pub.identifier || 'N/A'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {allPublications && allPublications.length === 0 && (
                    <p className="text-center py-8 text-muted-foreground">No publications found</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Query 2: User Borrowed Publications */}
        <TabsContent value="q2">
          <Card>
            <CardHeader>
              <CardTitle>Query 2: User Borrowed Publications</CardTitle>
              <CardDescription>
                Publications currently borrowed by a specific user
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="User Email (e.g., alice.johnson@ec-lyon.fr)"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                />
                <Input
                  placeholder="Lab ID (optional)"
                  value={labId}
                  onChange={(e) => setLabId(e.target.value)}
                  className="w-40"
                />
              </div>

              {userEmail && (
                <>
                  {loadingUserBorrow ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="border-b">
                          <tr>
                            <th className="text-left p-2">ID</th>
                            <th className="text-left p-2">Title</th>
                            <th className="text-left p-2">Type</th>
                            <th className="text-left p-2">Lab</th>
                            <th className="text-left p-2">Borrow Date</th>
                            <th className="text-left p-2">Due Date</th>
                            <th className="text-left p-2">Identifier</th>
                          </tr>
                        </thead>
                        <tbody>
                          {userBorrowings?.map((b: any, idx: number) => (
                            <tr key={idx} className="border-b hover:bg-muted/50">
                              <td className="p-2">{b.publication_id}</td>
                              <td className="p-2 font-medium">{b.title}</td>
                              <td className="p-2">
                                <span className="px-2 py-1 rounded-full bg-primary/10 text-primary text-xs">
                                  {b.publication_type}
                                </span>
                              </td>
                              <td className="p-2">{b.lab_name}</td>
                              <td className="p-2">{b.borrow_date}</td>
                              <td className="p-2">{b.due_date}</td>
                              <td className="p-2 font-mono text-xs">{b.identifier}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {userBorrowings && userBorrowings.length === 0 && (
                        <p className="text-center py-8 text-muted-foreground">No borrowings found</p>
                      )}
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Query 3: Lab Collection Value */}
        <TabsContent value="q3">
          <Card>
            <CardHeader>
              <CardTitle>Query 3: Lab Collection Value in EUR</CardTitle>
              <CardDescription>
                Total value of all publications owned by a specific lab
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Lab ID (e.g., 1 for LIRIS)"
                  value={labId}
                  onChange={(e) => setLabId(e.target.value)}
                  type="number"
                />
              </div>

              {labId && (
                <>
                  {loadingLabValue ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                  ) : labValue ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-3 gap-4">
                        <Card>
                          <CardContent className="pt-6">
                            <div className="text-2xl font-bold">{labValue.lab_name}</div>
                            <p className="text-xs text-muted-foreground">Lab Name</p>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="pt-6">
                            <div className="text-2xl font-bold text-success">
                              €{labValue.total_value_euro}
                            </div>
                            <p className="text-xs text-muted-foreground">Total Value (EUR)</p>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="pt-6">
                            <div className="text-2xl font-bold">{labValue.number_of_publications}</div>
                            <p className="text-xs text-muted-foreground">Number of Publications</p>
                          </CardContent>
                        </Card>
                      </div>

                      {labValue.breakdown && (
                        <div className="overflow-x-auto">
                          <p className="font-semibold mb-2">Breakdown by Publication:</p>
                          <table className="w-full text-sm">
                            <thead className="border-b">
                              <tr>
                                <th className="text-left p-2">Title</th>
                                <th className="text-right p-2">Original Price</th>
                                <th className="text-left p-2">Currency</th>
                                <th className="text-right p-2">Price in EUR</th>
                              </tr>
                            </thead>
                            <tbody>
                              {labValue.breakdown.map((item: any, idx: number) => (
                                <tr key={idx} className="border-b hover:bg-muted/50">
                                  <td className="p-2">{item.title}</td>
                                  <td className="p-2 text-right">{item.original_price || 'N/A'}</td>
                                  <td className="p-2">{item.currency || 'N/A'}</td>
                                  <td className="p-2 text-right font-medium">€{item.price_in_euro}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-center py-8 text-muted-foreground">No data found for this lab</p>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Query 4: Can User Borrow - Placeholder */}
        <TabsContent value="q4">
          <Card>
            <CardHeader>
              <CardTitle>Query 4: Can User Borrow Publication</CardTitle>
              <CardDescription>
                Check if a user can borrow a specific publication (Interactive feature - not included in simple view)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                This query requires user interaction and is available through the Publications page borrowing feature.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Query 5: Current Borrowers - Placeholder */}
        <TabsContent value="q5">
          <Card>
            <CardHeader>
              <CardTitle>Query 5: Find Current Borrowers</CardTitle>
              <CardDescription>
                Find who has borrowed copies of a specific publication (Interactive feature - not included in simple view)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                This query requires publication selection and is available through the Publications page.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Query 6: Publications by Category and Price */}
        <TabsContent value="q6">
          <Card>
            <CardHeader>
              <CardTitle>Query 6: Publications by Category and Max Price</CardTitle>
              <CardDescription>
                List books in a category under a specified price
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Category (e.g., Computer Science)"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                />
                <Input
                  placeholder="Max Price EUR (e.g., 100)"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  type="number"
                  className="w-40"
                />
              </div>

              {category && maxPrice && (
                <>
                  {loadingCategoryPrice ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="border-b">
                          <tr>
                            <th className="text-left p-2">ID</th>
                            <th className="text-left p-2">Title</th>
                            <th className="text-left p-2">ISBN</th>
                            <th className="text-right p-2">Min Price (EUR)</th>
                            <th className="text-left p-2">Publishers</th>
                            <th className="text-left p-2">Categories</th>
                          </tr>
                        </thead>
                        <tbody>
                          {categoryPriceData?.map((pub: any) => (
                            <tr key={pub.publication_id} className="border-b hover:bg-muted/50">
                              <td className="p-2">{pub.publication_id}</td>
                              <td className="p-2 font-medium">{pub.title}</td>
                              <td className="p-2 font-mono text-xs">{pub.isbn}</td>
                              <td className="p-2 text-right">€{pub.min_price_euro}</td>
                              <td className="p-2">{pub.publishers || 'N/A'}</td>
                              <td className="p-2">{pub.categories}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {categoryPriceData && categoryPriceData.length === 0 && (
                        <p className="text-center py-8 text-muted-foreground">No publications found</p>
                      )}
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Query 7: Publications by Author and Year */}
        <TabsContent value="q7">
          <Card>
            <CardHeader>
              <CardTitle>Query 7: Publications by Author After Year</CardTitle>
              <CardDescription>
                Publications by a specific author published after a given year
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Author Name (e.g., Tanenbaum)"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                />
                <Input
                  placeholder="After Year (e.g., 2015)"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  type="number"
                  className="w-40"
                />
              </div>

              {author && year && (
                <>
                  {loadingAuthorYear ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="border-b">
                          <tr>
                            <th className="text-left p-2">ID</th>
                            <th className="text-left p-2">Title</th>
                            <th className="text-left p-2">Year</th>
                            <th className="text-left p-2">Type</th>
                            <th className="text-left p-2">Authors</th>
                            <th className="text-left p-2">Publisher</th>
                          </tr>
                        </thead>
                        <tbody>
                          {authorYearData?.map((pub: any) => (
                            <tr key={pub.publication_id} className="border-b hover:bg-muted/50">
                              <td className="p-2">{pub.publication_id}</td>
                              <td className="p-2 font-medium">{pub.title}</td>
                              <td className="p-2">{pub.year_publication}</td>
                              <td className="p-2">
                                <span className="px-2 py-1 rounded-full bg-primary/10 text-primary text-xs">
                                  {pub.publication_type}
                                </span>
                              </td>
                              <td className="p-2">{pub.all_authors}</td>
                              <td className="p-2">{pub.publisher || 'N/A'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {authorYearData && authorYearData.length === 0 && (
                        <p className="text-center py-8 text-muted-foreground">No publications found</p>
                      )}
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Query 8: Publisher Chronology */}
        <TabsContent value="q8">
          <Card>
            <CardHeader>
              <CardTitle>Query 8: Publisher Books Chronological</CardTitle>
              <CardDescription>
                Chronological list of books by a specific publisher
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Publisher Name (e.g., Pearson)"
                  value={publisher}
                  onChange={(e) => setPublisher(e.target.value)}
                />
              </div>

              {publisher && (
                <>
                  {loadingPublisher ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="border-b">
                          <tr>
                            <th className="text-left p-2">Year</th>
                            <th className="text-left p-2">Title</th>
                            <th className="text-left p-2">ISBN</th>
                            <th className="text-left p-2">Authors</th>
                            <th className="text-left p-2">Edition</th>
                          </tr>
                        </thead>
                        <tbody>
                          {publisherData?.map((book: any, idx: number) => (
                            <tr key={idx} className="border-b hover:bg-muted/50">
                              <td className="p-2 font-bold">{book.year}</td>
                              <td className="p-2 font-medium">{book.title}</td>
                              <td className="p-2 font-mono text-xs">{book.isbn}</td>
                              <td className="p-2">{book.authors || 'Unknown'}</td>
                              <td className="p-2">{book.edition || 'N/A'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {publisherData && publisherData.length === 0 && (
                        <p className="text-center py-8 text-muted-foreground">No books found</p>
                      )}
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Query 9: Lost Books */}
        <TabsContent value="q9">
          <Card>
            <CardHeader>
              <CardTitle>Query 9: Lost Books Report</CardTitle>
              <CardDescription>
                All lost books sorted by owner lab and ISBN
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingLost ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="border-b">
                      <tr>
                        <th className="text-left p-2">Lab</th>
                        <th className="text-left p-2">ISBN</th>
                        <th className="text-left p-2">Title</th>
                        <th className="text-left p-2">Publisher</th>
                        <th className="text-right p-2">Price (EUR)</th>
                        <th className="text-left p-2">Original Currency</th>
                        <th className="text-left p-2">Purchase Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {lostBooks?.map((book: any, idx: number) => (
                        <tr key={idx} className="border-b hover:bg-muted/50">
                          <td className="p-2 font-medium">{book.owner_lab}</td>
                          <td className="p-2 font-mono text-xs">{book.isbn}</td>
                          <td className="p-2">{book.title}</td>
                          <td className="p-2">{book.publisher || 'N/A'}</td>
                          <td className="p-2 text-right font-medium">
                            {book.price_euro ? `€${book.price_euro}` : 'N/A'}
                          </td>
                          <td className="p-2">
                            {book.original_price && book.original_currency
                              ? `${book.original_price} ${book.original_currency}`
                              : 'N/A'}
                          </td>
                          <td className="p-2">{book.purchase_date || 'N/A'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {lostBooks && lostBooks.length === 0 && (
                    <p className="text-center py-8 text-muted-foreground">No lost books found</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
