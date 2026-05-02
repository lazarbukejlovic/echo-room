export type MotionVariant = "auth" | "app";

export const socialMessages = [
  { text: "New room opened", className: "left-[4%] top-[9%]", delay: "0s", duration: "22s" },
  { text: "3 people typing...", className: "left-[64%] top-[8%]", delay: "1.7s", duration: "18s" },
  { text: "Design thread is live", className: "left-[32%] top-[16%]", delay: "2.4s", duration: "20s" },
  { text: "Alex started a conversation", className: "left-[72%] top-[18%]", delay: "3.1s", duration: "24s" },
  { text: "Product feedback room", className: "left-[11%] top-[30%]", delay: "1.1s", duration: "19s" },
  { text: "Someone replied to your post", className: "left-[58%] top-[30%]", delay: "4.2s", duration: "21s" },
  { text: "12 active listeners", className: "left-[80%] top-[36%]", delay: "2.8s", duration: "23s" },
  { text: "Room trending now", className: "left-[25%] top-[41%]", delay: "0.9s", duration: "19s" },
  { text: "Mila joined from Berlin", className: "left-[6%] top-[52%]", delay: "3.8s", duration: "22s" },
  { text: "Follower request accepted", className: "left-[44%] top-[52%]", delay: "1.9s", duration: "20s" },
  { text: "New room: Remote work rituals", className: "left-[70%] top-[58%]", delay: "2.6s", duration: "25s" },
  { text: "Voice room active", className: "left-[16%] top-[68%]", delay: "4.4s", duration: "17s" },
  { text: "Conversation gaining traction", className: "left-[50%] top-[69%]", delay: "2.2s", duration: "24s" },
  { text: "2 new followers", className: "left-[82%] top-[73%]", delay: "0.6s", duration: "18s" },
  { text: "Live discussion started", className: "left-[32%] top-[84%]", delay: "3.5s", duration: "23s" },
];

export const presenceChips = [
  { text: "🇺🇸 New York", className: "left-[12%] top-[20%]", delay: "0.3s", duration: "28s" },
  { text: "🇬🇧 London", className: "left-[48%] top-[10%]", delay: "1.5s", duration: "30s" },
  { text: "🇩🇪 Berlin", className: "left-[84%] top-[13%]", delay: "3.1s", duration: "31s" },
  { text: "🇫🇷 Paris", className: "left-[34%] top-[26%]", delay: "2.6s", duration: "29s" },
  { text: "🇳🇱 Amsterdam", className: "left-[66%] top-[24%]", delay: "0.8s", duration: "27s" },
  { text: "🇮🇹 Milan", className: "left-[8%] top-[44%]", delay: "3.8s", duration: "32s" },
  { text: "🇭🇷 Zagreb", className: "left-[39%] top-[47%]", delay: "2.3s", duration: "28s" },
  { text: "🇧🇦 Sarajevo", className: "left-[74%] top-[46%]", delay: "1.1s", duration: "33s" },
  { text: "🇪🇸 Madrid", className: "left-[23%] top-[63%]", delay: "1.9s", duration: "29s" },
  { text: "🇵🇱 Warsaw", className: "left-[58%] top-[80%]", delay: "0.5s", duration: "31s" },
];

export const statusChips = [
  { text: "Live now", className: "left-[3%] top-[40%]", delay: "0.6s", duration: "17s" },
  { text: "Global conversations", className: "left-[77%] top-[30%]", delay: "1.6s", duration: "20s" },
  { text: "3 active rooms", className: "left-[86%] top-[56%]", delay: "2.6s", duration: "18s" },
  { text: "14 users online", className: "left-[8%] top-[76%]", delay: "3.5s", duration: "19s" },
  { text: "Now joining", className: "left-[71%] top-[86%]", delay: "0.9s", duration: "21s" },
  { text: "Room active", className: "left-[40%] top-[35%]", delay: "2.1s", duration: "16s" },
  { text: "Trending", className: "left-[52%] top-[61%]", delay: "3.4s", duration: "18s" },
  { text: "Typing...", className: "left-[26%] top-[90%]", delay: "1.3s", duration: "19s" },
];

export const avatarChips = [
  { initials: "AL", className: "left-[18%] top-[14%]", delay: "0.5s", duration: "15s" },
  { initials: "MK", className: "left-[60%] top-[13%]", delay: "2.2s", duration: "14s" },
  { initials: "JO", className: "left-[90%] top-[21%]", delay: "3.1s", duration: "16s" },
  { initials: "RM", className: "left-[28%] top-[34%]", delay: "1.7s", duration: "13s" },
  { initials: "SK", className: "left-[82%] top-[43%]", delay: "2.7s", duration: "14s" },
  { initials: "PD", className: "left-[47%] top-[50%]", delay: "0.8s", duration: "15s" },
  { initials: "TI", className: "left-[15%] top-[59%]", delay: "3.6s", duration: "12s" },
  { initials: "AN", className: "left-[69%] top-[67%]", delay: "1.9s", duration: "13s" },
  { initials: "VE", className: "left-[34%] top-[78%]", delay: "2.9s", duration: "15s" },
  { initials: "LP", className: "left-[88%] top-[83%]", delay: "1.1s", duration: "14s" },
];

export const networkNodes = [
  { className: "left-[8%] top-[12%]", size: "h-1.5 w-1.5", delay: "0s" },
  { className: "left-[23%] top-[18%]", size: "h-2 w-2", delay: "0.8s" },
  { className: "left-[40%] top-[12%]", size: "h-1.5 w-1.5", delay: "1.5s" },
  { className: "left-[58%] top-[20%]", size: "h-2 w-2", delay: "2.2s" },
  { className: "left-[74%] top-[11%]", size: "h-1.5 w-1.5", delay: "1.3s" },
  { className: "left-[88%] top-[24%]", size: "h-2 w-2", delay: "2.9s" },
  { className: "left-[14%] top-[38%]", size: "h-2 w-2", delay: "1.9s" },
  { className: "left-[36%] top-[34%]", size: "h-1.5 w-1.5", delay: "0.5s" },
  { className: "left-[52%] top-[42%]", size: "h-2 w-2", delay: "3.3s" },
  { className: "left-[68%] top-[40%]", size: "h-1.5 w-1.5", delay: "2.6s" },
  { className: "left-[83%] top-[50%]", size: "h-2 w-2", delay: "0.9s" },
  { className: "left-[7%] top-[58%]", size: "h-1.5 w-1.5", delay: "1.1s" },
  { className: "left-[28%] top-[62%]", size: "h-2 w-2", delay: "3s" },
  { className: "left-[43%] top-[74%]", size: "h-1.5 w-1.5", delay: "2.1s" },
  { className: "left-[62%] top-[68%]", size: "h-2 w-2", delay: "0.4s" },
  { className: "left-[79%] top-[78%]", size: "h-1.5 w-1.5", delay: "2.4s" },
  { className: "left-[92%] top-[70%]", size: "h-2 w-2", delay: "1.7s" },
];

export const networkLinks = [
  { className: "left-[9%] top-[14%] w-28 rotate-[16deg]", delay: "0.4s", duration: "15s" },
  { className: "left-[26%] top-[18%] w-36 -rotate-[10deg]", delay: "1.6s", duration: "14s" },
  { className: "left-[44%] top-[16%] w-[7.5rem] rotate-[11deg]", delay: "2.3s", duration: "16s" },
  { className: "left-[60%] top-[22%] w-[8.5rem] -rotate-[12deg]", delay: "3s", duration: "15s" },
  { className: "left-[18%] top-[38%] w-40 rotate-[7deg]", delay: "1s", duration: "17s" },
  { className: "left-[45%] top-[42%] w-32 -rotate-[15deg]", delay: "2.1s", duration: "14s" },
  { className: "left-[66%] top-[42%] w-[7.5rem] rotate-[18deg]", delay: "0.7s", duration: "16s" },
  { className: "left-[10%] top-[60%] w-[9.5rem] -rotate-[8deg]", delay: "2.7s", duration: "15s" },
  { className: "left-[34%] top-[72%] w-36 rotate-[10deg]", delay: "1.4s", duration: "18s" },
  { className: "left-[60%] top-[70%] w-32 -rotate-[11deg]", delay: "2.9s", duration: "16s" },
];

export const movingSignals = [
  { className: "left-[15%] top-[22%]", delay: "0s", duration: "9s" },
  { className: "left-[42%] top-[30%]", delay: "1.4s", duration: "11s" },
  { className: "left-[70%] top-[38%]", delay: "2.2s", duration: "10s" },
  { className: "left-[20%] top-[58%]", delay: "0.9s", duration: "12s" },
  { className: "left-[56%] top-[66%]", delay: "2.8s", duration: "11s" },
  { className: "left-[80%] top-[74%]", delay: "1.8s", duration: "10s" },
];
