export type Message = {
    messageId: number;
    type: string;
    name:string;
    otherUserId: number;
    role: string;
    message: string;
    createdAt: string;
    viewStatus: string;
    fileType: string;
  };
  
  export type UserMessage = {
    messageId: number ;
    senderId: number;
    receiverId: number;
    message: string;
    createdAt: string;
    viewStatus: string;
    fileType: string;
    fileUrl: string | null;
  };
  