import React, { useRef, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { useChatScroll } from '@/hooks/use-chat-scroll';
import type { ChatMessage } from '@/hooks/use-realtime-chat';
import { cn } from '@/lib/utils';

interface RealtimeChatProps {
  messages: ChatMessage[];
  isLoading?: boolean;
  currentUserId?: string | null;
  scrollRef?: React.RefObject<HTMLDivElement>;
}

export function RealtimeChat({
  messages,
  isLoading,
  currentUserId,
  scrollRef
}: RealtimeChatProps) {
  const formatTime = (isoString: string): string => {
    try {
      return new Date(isoString).toLocaleTimeString('es-AR', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
    } catch (e) {
      return '--:--';
    }
  };

  return (
    <div className="space-y-4 p-4" ref={scrollRef}>
      {messages.map((message) => {
        const isCurrentUser = message.senderId && message.senderId === currentUserId;
        return (
          <div
            key={message.id}
            className={cn(
              'flex items-end gap-2',
              isCurrentUser ? 'justify-end' : 'justify-start'
            )}
          >
            {!isCurrentUser && (
              <Avatar className="h-8 w-8">
                <AvatarFallback>{message.user.name.substring(0, 1).toUpperCase()}</AvatarFallback>
              </Avatar>
            )}
            <div
              className={cn(
                'max-w-[70%] rounded-lg p-3 shadow',
                isCurrentUser
                  ? 'bg-blue-500 text-white rounded-br-none'
                  : 'bg-gray-100 text-gray-800 rounded-bl-none'
              )}
            >
              <p className="text-sm break-words">{message.content}</p>
              <span className={cn(
                "block text-xs mt-1",
                isCurrentUser ? "text-blue-100" : "text-gray-500"
              )}>
                {formatTime(message.createdAt)}
              </span>
            </div>
            {isCurrentUser && (
              <Avatar className="h-8 w-8">
                <AvatarFallback>{'TÚ'}</AvatarFallback>
              </Avatar>
            )}
          </div>
        );
      })}
      {isLoading && messages.length === 0 && (
         <div className="space-y-2">
           <Skeleton className="h-10 w-3/5" />
           <Skeleton className="h-10 w-4/5 ml-auto" />
           <Skeleton className="h-10 w-3/5" />
         </div>
       )} 
     </div>
  );
} 