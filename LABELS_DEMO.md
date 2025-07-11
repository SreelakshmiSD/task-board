# Task Card Labels System

## Overview
I've implemented a comprehensive labeling system for your task cards, similar to Trello's labels feature. This allows you to categorize and organize your tasks with colored labels.

## Features

### 🏷️ Predefined Labels
The system comes with 8 predefined labels with distinct colors:

- **Could** - Green label for optional features
- **Should** - Yellow label for recommended tasks  
- **Must** - Red label for critical/required tasks
- **Reminder** - Purple label for follow-up items
- **Priority** - Blue label for high-priority tasks
- **Bug** - Orange label for bug fixes
- **Feature** - Indigo label for new features
- **Review** - Pink label for items needing review

### 🎨 Visual Design
- Each label has a distinct background color with white text for maximum readability
- Labels appear as small rounded badges on task cards
- Multiple labels can be applied to a single task
- Labels are displayed prominently below the task title

### 🖱️ Easy Management
- Click the "More" button (⋯) on any task card
- Select "Edit Labels" to open the label picker
- Use checkboxes to select/deselect labels
- Changes are applied instantly

## How to Use

1. **Open Label Picker**: Click the three-dot menu on any task card and select "Edit Labels"

2. **Select Labels**: Check the boxes next to the labels you want to apply to the task

3. **View Labels**: Selected labels will appear as colored badges on the task card

4. **Remove Labels**: Uncheck labels in the picker to remove them from the task

## Technical Implementation

### Components Modified
- `TaskCard.tsx` - Added label picker UI and label display
- `TaskColumn.tsx` - Added label change prop passing
- `page.tsx` - Added label change handler
- `api.ts` - Updated mock data with sample labels

### Data Structure
Labels are stored in the `tags` field of each task as an array of strings:
```typescript
task: {
  id: 1,
  title: "Sample Task",
  tags: ["Must", "Priority", "Bug"]
  // ... other fields
}
```

### Styling
Labels use Tailwind CSS classes for consistent styling:
- Background colors: `bg-green-500`, `bg-red-500`, etc.
- Text color: `text-white` for all labels
- Size: `text-xs` with `px-2 py-1` padding
- Shape: `rounded` corners

## Future Enhancements

The current implementation provides a solid foundation that can be extended with:

1. **Custom Labels**: Allow users to create their own labels with custom colors
2. **Label Categories**: Group labels by type (priority, status, department, etc.)
3. **Label Filtering**: Filter tasks by selected labels
4. **Label Analytics**: Show task distribution by label
5. **API Integration**: Persist label changes to your backend API

## Sample Data

I've updated the mock data to include sample labels on existing tasks so you can see the system in action immediately.

---

The labeling system is now fully functional and ready to use! You can start organizing your tasks with the predefined labels right away.
