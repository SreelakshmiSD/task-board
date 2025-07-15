# 🏷️ Trello-like Color Labels Feature

This implementation adds Trello-style color labels to task cards with local storage persistence. No backend changes are required as all label data is stored locally in the browser.

## Features

### ✨ Core Functionality
- **Trello-style Labels**: Color-coded labels with emojis (🔴 Red = "Meeting", 🟡 Yellow = "Bug", 🟢 Green = "Feature", etc.)
- **Local Storage**: All label data is stored locally in the browser using localStorage
- **No Backend Required**: Completely frontend-only implementation
- **Persistent**: Labels persist across browser sessions
- **Real-time Updates**: Instant UI feedback when adding/removing labels

### 🎨 Visual Design
- **Emoji Support**: Each label has an associated emoji for better visual recognition
- **Color Coding**: Full Tailwind CSS color palette support
- **Priority Sorting**: Labels are sorted by priority on task cards
- **Responsive**: Works on all screen sizes
- **Hover Effects**: Tooltips show label names and emojis

### 🏷️ Default Labels

#### Priority Labels
-  **Critical** (Red) - Priority 5
-  **High** (Red) - Priority 4  
-  **Intermediate** (Yellow) - Priority 3
-  **Low** (Green) - Priority 2
-  **Non-billable** (Gray) - Priority 1

#### Type Labels
-  **Meeting** (Red) - Priority 4
-  **Bug** (Yellow) - Priority 4
-  **Feature** (Green) - Priority 3
-  **Testing** (Orange) - Priority 3
-  **Review** (Blue) - Priority 2
-  **Documentation** (Purple) - Priority 2
-  **Research** (Indigo) - Priority 2

#### Status Labels
-  **Urgent** (Dark Red) - Priority 5

## How to Use

### 1. Adding Labels to Tasks
1. Hover over any task card
2. Click the "More" button (⋯) in the top-right corner
3. Select "Labels" from the dropdown menu
4. Check/uncheck labels to add or remove them
5. Labels are automatically saved to localStorage

### 2. Managing Labels
1. Click the "Labels" button in the top header
2. View all existing labels
3. Add new custom labels with:
   - Custom name
   - Emoji
   - Color selection
   - Category (Priority, Type, Status, Custom)
   - Priority level (1-5)
4. Edit existing labels
5. Delete labels (with confirmation)

### 3. Label Display
- Labels appear at the top of each task card
- Show emoji + label name in colored badges
- Sorted by priority (highest first)
- Truncated text for long label names
- Hover to see full label name

## Technical Implementation

### Files Added/Modified

#### New Files
- `src/lib/services/labelStorageService.ts` - Local storage service for labels
- `src/components/LabelManager.tsx` - Label management modal
- `TRELLO_LABELS_README.md` - This documentation

#### Modified Files
- `src/components/TaskCard.tsx` - Enhanced with Trello-style label display and picker
- `src/app/(dashboard)/board/page.tsx` - Added Label Manager integration

### Local Storage Structure

#### Labels Storage (`trello_labels`)
```json
[
  {
    "id": "meeting",
    "name": "Meeting",
    "emoji": "🔴",
    "color": "bg-red-500",
    "textColor": "text-white",
    "priority": 4,
    "category": "type",
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

#### Task Labels Storage (`task_labels`)
```json
{
  "123": {
    "taskId": 123,
    "labels": ["Meeting", "High", "Bug"],
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### API Integration
- Labels are stored locally and don't require API calls
- Existing task `tags` field is merged with local labels for backward compatibility
- Parent component receives label updates via `onLabelsChange` callback
- Can be easily extended to sync with backend API if needed

## Customization

### Adding New Label Colors
Edit the `colorOptions` array in `LabelManager.tsx`:
```typescript
const colorOptions = [
  { name: 'Custom Color', value: 'bg-custom-500', text: 'text-white' },
  // ... existing colors
];
```

### Modifying Default Labels
Edit the `DEFAULT_LABELS` array in `labelStorageService.ts`:
```typescript
{
  id: 'custom-label',
  name: 'Custom Label',
  emoji: '🎯',
  color: 'bg-blue-500',
  textColor: 'text-white',
  priority: 3,
  category: 'custom',
  isActive: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}
```

## Browser Compatibility
- Works in all modern browsers that support localStorage
- Gracefully degrades if localStorage is not available
- No external dependencies required

## Future Enhancements
- [ ] Export/Import label configurations
- [ ] Label templates for different project types
- [ ] Bulk label operations
- [ ] Label usage analytics
- [ ] Keyboard shortcuts for common labels
- [ ] Label search and filtering
- [ ] Backend API synchronization
- [ ] Team-wide label sharing

## Troubleshooting

### Labels Not Showing
1. Check browser console for localStorage errors
2. Verify localStorage is enabled in browser settings
3. Clear localStorage and refresh to reset to defaults

### Labels Not Persisting
1. Ensure localStorage quota is not exceeded
2. Check for browser privacy settings blocking localStorage
3. Verify the domain is not in incognito/private mode

### Performance Issues
1. Large numbers of labels (>100) may impact performance
2. Consider implementing label pagination if needed
3. Use browser dev tools to monitor localStorage usage
