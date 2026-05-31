# 🖥️ Frontend Specification

## Tech Stack
- **Framework**: React.js 18
- **Styling**: Tailwind CSS
- **State Management**: React Query (server state) + useState/useContext (UI state)
- **HTTP**: Axios
- **Streaming**: EventSource (SSE)
- **Routing**: React Router v6

---

## Pages

### 1. Home Page `/`

**Purpose**: Entry point. User pastes video URLs and starts analysis.

**Layout**:
```
┌──────────────────────────────────────────────┐
│  LOGO        VidIQ Comparator                │
├──────────────────────────────────────────────┤
│                                              │
│   Compare any two videos with AI             │
│   Understand why one performed better        │
│                                              │
│   [ YouTube URL Input Field              ]   │
│   [ Instagram URL Input Field            ]   │
│                                              │
│           [ 🚀 Analyze Videos ]              │
│                                              │
│   Recent Sessions (if any)                  │
│   ┌──────────┐ ┌──────────┐ ┌──────────┐   │
│   │ Session 1│ │ Session 2│ │ Session 3│   │
│   └──────────┘ └──────────┘ └──────────┘   │
└──────────────────────────────────────────────┘
```

---

### 2. Analysis Dashboard `/dashboard/:analysisId`

**Purpose**: Shows metadata, engagement metrics, and initial AI comparison summary.

**Layout**:
```
┌──────────────────────────────────────────────┐
│  ← Back    Analysis Dashboard                │
├──────────────────────────────────────────────┤
│                                              │
│  ┌──────────────────┐ ┌──────────────────┐   │
│  │ YouTube VideoCard│ │Instagram VideoCard│  │
│  │ Thumbnail        │ │ Thumbnail        │   │
│  │ Title: ...       │ │ Caption: ...     │   │
│  │ Channel: ...     │ │ Creator: ...     │   │
│  │ Views: 1.2M      │ │ Plays: 340K      │   │
│  │ Likes: 45K       │ │ Likes: 18K       │   │
│  │ Comments: 2.1K   │ │ Comments: 890    │   │
│  │ Eng Rate: 3.9%   │ │ Eng Rate: 5.6%   │   │
│  └──────────────────┘ └──────────────────┘   │
│                                              │
│  ┌────────────────────────────────────────┐   │
│  │  ComparisonCard — AI Summary           │   │
│  │  "Instagram video has higher           │   │
│  │  engagement despite fewer views..."    │   │
│  └────────────────────────────────────────┘   │
│                                              │
│  [ 💬 Open Chat to dig deeper ]              │
└──────────────────────────────────────────────┘
```

---

### 3. Chat Interface `/chat/:analysisId`

**Purpose**: AI-powered Q&A with both videos.

**Layout**:
```
┌──────────────────────────────────────────────┐
│  ← Dashboard       Chat with Videos         │
├─────────────────────────┬────────────────────┤
│  Chat History           │  Context Panel     │
│                         │                    │
│  [user] Why did IG      │  📺 Video A        │
│  video do better?       │  🎬 Video B        │
│                         │                    │
│  [AI] Based on the      │  Top Sources Used: │
│  transcript analysis... │  [A-01:24] "..."   │
│  [SourceCitation]       │  [B-00:45] "..."   │
│                         │                    │
│  [user] What hook       │                    │
│  did Video B use?       │                    │
│                         │                    │
│  [AI streaming...]      │                    │
│  ▊                      │                    │
├─────────────────────────┴────────────────────┤
│  [ Ask a question about both videos...  ]    │
│  [ Suggested: "Compare the CTAs" ] [Send]   │
└──────────────────────────────────────────────┘
```

---

## Components

### `VideoInput`
- Props: `onSubmit(ytUrl, igUrl)`
- Validates URL format (regex)
- Shows inline validation errors
- Disable button while loading

### `VideoCard`
- Props: `{ platform, title, thumbnail, views, likes, comments, engagementRate }`
- Platform badge: YouTube (red) / Instagram (purple)
- Engagement rate shown with color indicator (green/yellow/red)

### `MetadataCard`
- Props: `{ label, value, icon }`
- Reusable stat display tile
- Used inside VideoCard

### `ComparisonCard`
- Props: `{ analysisId }`
- Fetches AI-generated comparison summary
- Skeleton loader while fetching
- Expandable details

### `ChatPanel`
- Props: `{ analysisId, sessionId }`
- Manages message list state
- Sends POST /chat on submit
- Uses EventSource for streaming
- Auto-scrolls to latest message

### `SourceCitation`
- Props: `{ videoLabel, timestamp, excerpt }`
- Renders as an inline badge
- Clicking jumps to source in context panel
- Example: `[Video A - 01:24] "strong CTA here"`

### `LoadingOverlay`
- Shows multi-step progress during analysis
- Steps: Fetching → Transcribing → Embedding → Ready

---

## State Management

### Loading States

```
idle → loading → success
              └→ error
```

| State | UI |
|---|---|
| `idle` | Default form |
| `loading` | Spinner + progress steps |
| `success` | Dashboard rendered |
| `error` | Error toast + retry button |

### Chat States

```
idle → sending → streaming → done
               └→ error
```

### Global State (Context)
```js
{
  currentAnalysis: { analysisId, metadata, engagement },
  sessionId: string,
  chatHistory: Message[],
  theme: 'light' | 'dark'
}
```

---

## Key UI Rules
- All async actions show a skeleton loader — no blank screens
- Errors always show a "Retry" button
- Chat messages are never lost on page refresh (saved to MongoDB)
- Mobile first — all layouts stack vertically on small screens