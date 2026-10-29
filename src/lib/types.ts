export type ProjectView = {
  id: string;
  title: string;
  description: string | null;
  scratchUrl: string;
  authorName: string;
  createdAt: string;
  hearts: number;
  comments: number;
  monthVotes: number;
  hearted: boolean;
  voted: boolean;
};

export type CommentView = {
  id: string;
  content: string;
  userName: string;
  createdAt: string;
  mine: boolean;
};
