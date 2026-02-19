"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { collaborationApi, Comment } from "@/lib/api/collaboration";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MessageSquare, Send, Loader2 } from "lucide-react";
import { formatDateShort } from "@/lib/utils/formatters";
import { toast } from "sonner";

interface CommentSheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    modelLabel: string;
    objectId: string;
    title: string;
    isAccountant?: boolean;
}

export function CommentSheet({
    open,
    onOpenChange,
    modelLabel,
    objectId,
    title,
    isAccountant = false,
}: CommentSheetProps) {
    const qc = useQueryClient();
    const [newComment, setNewComment] = useState("");
    const [isInternal, setIsInternal] = useState(isAccountant);

    const { data: comments, isLoading } = useQuery({
        queryKey: ["comments", modelLabel, objectId],
        queryFn: () => collaborationApi.listComments({
            model_label: modelLabel,
            object_id: objectId
        } as any),
        enabled: open && !!objectId,
    });

    const createMutation = useMutation({
        mutationFn: (body: string) =>
            collaborationApi.createComment({
                model_label: modelLabel,
                object_id: objectId,
                body,
                is_internal: isInternal,
            } as any),
        onSuccess: () => {
            setNewComment("");
            qc.invalidateQueries({ queryKey: ["comments", modelLabel, objectId] });
            toast.success("Commentaire ajouté");
        },
        onError: () => toast.error("Erreur lors de l'ajout du commentaire"),
    });

    const handleSend = () => {
        if (!newComment.trim()) return;
        createMutation.mutate(newComment);
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="sm:max-w-md flex flex-col h-full border-l border-indigo-100 dark:border-indigo-900">
                <SheetHeader className="pb-4 border-b">
                    <SheetTitle className="flex items-center gap-2">
                        <MessageSquare className="h-5 w-5 text-indigo-600" />
                        Discussion
                    </SheetTitle>
                    <SheetDescription className="text-xs uppercase font-semibold text-muted-foreground">
                        {title}
                    </SheetDescription>
                </SheetHeader>

                <ScrollArea className="flex-1 pr-4 -mr-4 my-4">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-10">
                            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        </div>
                    ) : comments?.results.length === 0 ? (
                        <div className="text-center py-10 space-y-2">
                            <p className="text-sm text-muted-foreground italic">Aucun commentaire pour le moment.</p>
                        </div>
                    ) : (
                        <div className="space-y-6 py-2">
                            {comments?.results.map((comment: Comment) => (
                                <div key={comment.id} className="flex gap-3">
                                    <Avatar className="h-8 w-8 text-[10px] bg-indigo-50 border border-indigo-100 dark:bg-indigo-950 dark:border-indigo-900">
                                        <AvatarFallback className="text-indigo-700 dark:text-indigo-400">
                                            {comment.author.full_name?.split(" ").map(n => n[0]).join("") || comment.author.email[0].toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 space-y-1">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-semibold">{comment.author.full_name || comment.author.email}</span>
                                            <span className="text-[10px] text-muted-foreground">{formatDateShort(comment.created_at)}</span>
                                        </div>
                                        <div className={`text-sm p-3 rounded-2xl ${comment.is_internal
                                                ? "bg-amber-50 border border-amber-100 dark:bg-amber-950/20 dark:border-amber-900/50"
                                                : "bg-muted/50 border border-border"
                                            }`}>
                                            {comment.is_internal && (
                                                <span className="text-[10px] font-bold text-amber-600 block mb-1 uppercase tracking-wider">Note Interne</span>
                                            )}
                                            {comment.body}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>

                <div className="pt-4 border-t space-y-3">
                    {isAccountant && (
                        <div className="flex items-center gap-2">
                            <Button
                                variant={isInternal ? "default" : "outline"}
                                size="xs"
                                className={`text-[10px] h-6 px-2 ${isInternal ? "bg-amber-600 hover:bg-amber-500" : ""}`}
                                onClick={() => setIsInternal(true)}
                            >
                                Note Interne
                            </Button>
                            <Button
                                variant={!isInternal ? "default" : "outline"}
                                size="xs"
                                className="text-[10px] h-6 px-2"
                                onClick={() => setIsInternal(false)}
                            >
                                Public
                            </Button>
                        </div>
                    )}
                    <div className="relative">
                        <Textarea
                            placeholder="Écrivez un message..."
                            className="min-h-[100px] bg-muted/30 resize-none pr-12 focus-visible:ring-indigo-600"
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                        />
                        <Button
                            size="icon"
                            className="absolute bottom-3 right-3 h-8 w-8 bg-indigo-600 hover:bg-indigo-500"
                            disabled={!newComment.trim() || createMutation.isPending}
                            onClick={handleSend}
                        >
                            {createMutation.isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Send className="h-4 w-4" />
                            )}
                        </Button>
                    </div>
                    <p className="text-[10px] text-muted-foreground text-center">
                        {isInternal
                            ? "Ce message ne sera visible que par votre cabinet."
                            : "Ce message sera visible par le client."}
                    </p>
                </div>
            </SheetContent>
        </Sheet>
    );
}
