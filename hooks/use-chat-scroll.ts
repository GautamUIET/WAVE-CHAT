import { useEffect, useState } from "react";

type ChatScrollProps = {
  chatRef: React.RefObject<HTMLDivElement>;
  bottomRef: React.RefObject<HTMLDivElement>;
  shouldLoadMore: boolean;
  loadMore: () => void;
  count: number;
};

export const useChatScroll = ({
  chatRef,
  bottomRef,
  shouldLoadMore,
  loadMore,
  count
}: ChatScrollProps) => {
  const [hasInitialized, setHasInitialized] = useState(false);
  const [lastCount, setLastCount] = useState(count);

  useEffect(() => {
    const topDiv = chatRef?.current;

    const handleScroll = () => {
      const scrollTop = topDiv?.scrollTop;

      // Load more when scrolled to the top and shouldLoadMore is true
      if (scrollTop === 0 && shouldLoadMore) {
        loadMore();
      }
    };

    // Debounce scroll event handling for better performance
    let scrollTimeout: NodeJS.Timeout;
    const debounceHandleScroll = () => {
      if (scrollTimeout) clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(handleScroll, 100);
    };

    topDiv?.addEventListener("scroll", debounceHandleScroll);

    return () => topDiv?.removeEventListener("scroll", debounceHandleScroll);
  }, [shouldLoadMore, loadMore, chatRef]);

  useEffect(() => {
    const bottomDiv = bottomRef?.current;
    const topDiv = chatRef?.current;

    const shouldAutoScroll = () => {
      if (!hasInitialized && bottomDiv) {
        setHasInitialized(true);
        return true;
      }

      if (!topDiv) return false;

      const distanceFromBottom =
        topDiv.scrollHeight - topDiv.scrollTop - topDiv.clientHeight;

      // Auto-scroll only if the user is close to the bottom (within 100px)
      return distanceFromBottom <= 100;
    };

    if (shouldAutoScroll()) {
      setTimeout(() => {
        bottomRef.current?.scrollIntoView({
          behavior: "smooth",
        });
      }, 100);
    }
  }, [bottomRef, chatRef, count, hasInitialized]);

  // Scroll to the bottom when a new message is added (i.e., when `count` changes)
  useEffect(() => {
    if (count > lastCount) {

      setTimeout(() => {
        bottomRef.current?.scrollIntoView({
          behavior: "smooth",
        });
      }, 100);
    }
    setLastCount(count); // Update last count to current count
  }, [count, lastCount, bottomRef]);
};
