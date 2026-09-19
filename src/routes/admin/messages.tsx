import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { MessageSquareText } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { fetchAdminMessages, getStoredReadMessageIds, setStoredReadMessageIds } from "@/lib/admin";

export const Route = createFileRoute("/admin/messages")({
  component: AdminMessages,
});

function AdminMessages() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin-messages"],
    queryFn: fetchAdminMessages,
  });

  const readIds = getStoredReadMessageIds();

  const toggleRead = (id: string) => {
    const next = readIds.includes(id)
      ? readIds.filter((value) => value !== id)
      : [...readIds, id];
    setStoredReadMessageIds(next);
    window.dispatchEvent(new Event("warista-message-read"));
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="text-xl">Contact messages</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="space-y-3 p-4">
              <Skeleton className="h-14 w-full rounded-lg" />
              <Skeleton className="h-14 w-full rounded-lg" />
            </div>
          ) : isError ? (
            <div className="p-4 text-sm text-destructive">Messages could not be loaded.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.map((message) => {
                  const isRead = readIds.includes(message.id);
                  return (
                    <TableRow key={message.id} className={isRead ? "bg-muted/20" : ""}>
                      <TableCell>
                        <div className="flex items-center gap-2 font-medium">
                          {!isRead && <MessageSquareText className="size-4 text-brand" />}
                          {message.name}
                        </div>
                      </TableCell>
                      <TableCell>{message.email}</TableCell>
                      <TableCell className="max-w-md whitespace-pre-wrap text-sm">{message.message}</TableCell>
                      <TableCell className="text-muted-foreground">{new Date(message.created_at).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <button onClick={() => toggleRead(message.id)} className="rounded-full border border-border bg-background px-2 py-1 text-xs font-medium">
                          {isRead ? "Mark unread" : "Mark read"}
                        </button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
