# Add Supplier Component - UX/HCI Design Guide

## Visual Design System

### Color Palette
```
Primary Action: Orange
  - Normal: from-orange-600 to-orange-500
  - Hover: from-orange-700 to-orange-600
  - Disabled: from-orange-400 to-orange-400

Secondary: Stone/Neutral
  - Light: stone-200, stone-50
  - Dark: neutral-700, neutral-800

Status Colors:
  - Success: green-600 (backgrounds: green-50/green-950)
  - Error: red-600 (backgrounds: red-50/red-950)
  - Warning: amber-700 (backgrounds: amber-50/amber-950)
```

### Typography Hierarchy

```
Page Title (h2)
  - Size: text-3xl
  - Weight: font-bold
  - Color: text-neutral-900 dark:text-stone-100

Section Headers (h3)
  - Size: text-lg
  - Weight: font-semibold
  - Indicator: Orange dot (h-1 w-1 rounded-full)

Field Labels
  - Size: text-sm
  - Weight: font-semibold
  - Color: text-neutral-700
  - Format: [Icon] Label Name *

Helper/Error Text
  - Size: text-xs
  - Color: varies (red-600 for errors, stone-500 for helpers)
  - Icon: ✕ for errors

Placeholder Text
  - Descriptive examples
  - Format: e.g., [example]
```

### Spacing System

```
Form Container Padding: p-6 sm:p-8 (24px / 32px)
Section Spacing: space-y-6 (24px between sections)
Field Grouping: gap-5 (20px between fields)
Alert Spacing: mb-6 (24px below alerts)
Button Gap: gap-3 (12px between buttons)
Label to Input: mb-2 (8px)
Icon to Text: mr-2 (8px)
```

### Input Field Styling

```
Height: py-3 (12px padding top/bottom)
Width Padding: px-4 (16px left/right)
Border: border-2
Border Radius: rounded-lg
Focus Ring: ring-2 with opacity
Shadow: shadow-sm hover:shadow-md
States:
  - Normal: border-stone-200
  - Focus: border-orange-500 ring-orange-500/20
  - Error: border-red-400 ring-red-500/20
  - Disabled: opacity reduction
```

### Button Styling

```
Primary Button (Add Supplier):
  - Background: gradient (orange-600 → orange-500)
  - Padding: px-8 py-3
  - Text: text-sm font-bold text-white
  - Shadow: shadow-md hover:shadow-lg
  - Active: scale-95
  - Disabled: opacity and cursor changes
  - Icon: faCheckCircle or spinner

Secondary Button (Cancel):
  - Background: stone-200 (light) or neutral-700 (dark)
  - Padding: px-8 py-3
  - Text: text-sm font-bold
  - Icon: faArrowLeft
  - Hover: Darker shade
```

### Form Container

```
Background: bg-stone-50 dark:bg-neutral-800/50
Border: border border-stone-200 dark:border-neutral-700/50
Padding: p-6 sm:p-8
Radius: rounded-2xl
Shadow: Implicit via background color
```

---

## Interaction Patterns

### Form Submission Flow

```
1. User fills fields
   ↓
2. User leaves field (blur event)
   ↓
3. Real-time validation triggers
   ├─ If invalid: Show error below field
   └─ If valid: Clear any previous error
   ↓
4. User clicks Submit
   ↓
5. Full form validation
   ├─ If invalid: Show summary warning
   └─ If valid: Proceed to next step
   ↓
6. Send request
   ├─ Button disabled
   ├─ Show loading spinner
   └─ Prevent double submission
   ↓
7. Success response
   ├─ Show success message
   ├─ Auto-redirect after 2 seconds
   └─ Or show error message on failure
```

### Error States

```
Level 1: Field Validation (Real-time)
  - Red border appears as user types/leaves field
  - Error message shows below field
  - Clear on successful re-entry

Level 2: Form Validation (On Submit)
  - Summary error shows if multiple fields invalid
  - Prevents form submission
  - Highlights all problematic fields

Level 3: Server Validation
  - API error message in alert box
  - Clear button to dismiss
  - Form remains enabled for correction
```

### Success Flow

```
1. Form submitted successfully
2. Success message appears (slide-in animation)
3. Form fields cleared
4. User can see confirmation
5. Auto-redirect after 2 seconds
```

### Mobile Responsive Behavior

```
Mobile (< 640px):
  - Single column form fields
  - Full-width buttons stacked vertically
  - Smaller padding (p-6)
  - Larger touch targets (py-3 inputs)

Tablet (640px - 1024px):
  - 2-column grid for some fields
  - Buttons side-by-side if space allows
  - Normal padding

Desktop (> 1024px):
  - 2-column grid for contacts
  - Full sections displayed
  - Optimal spacing and readability
```

---

## Accessibility Guidelines

### Keyboard Navigation
```
Tab Order (left to right, top to bottom):
1. Sidebar toggle (mobile)
2. Supplier Name input
3. Contact Person input
4. Phone Number input
5. Email input
6. Address input
7. Add Supplier button
8. Cancel button
```

### Screen Reader Support
```
Page Landmarks:
- Main content section clearly defined
- Form sections use heading hierarchy
- Buttons labeled with clear text

Field Associations:
- <label> properly associated with <input>
- aria-label provided as fallback
- aria-describedby links to error messages
- aria-invalid marks error states
```

### Color Contrast
```
Text on Primary: WCAG AAA (7:1+)
Text on Secondary: WCAG AA (4.5:1+)
Error/Success Colors: Accessible without color alone
Icons paired with text for clarity
```

---

## State Indicators

### Visual Feedback Elements

```
Input States:
  ✓ Default: Neutral border
  ✓ Focused: Orange border + ring
  ✓ Filled: User has entered data
  ✓ Error: Red border + error message
  ✓ Success: Field validates (no visual change, no error)
  ✓ Disabled: Reduced opacity, cursor-not-allowed

Button States:
  ✓ Idle: Ready to click
  ✓ Hover: Darker gradient, enhanced shadow
  ✓ Active: Scale animation
  ✓ Disabled: Reduced opacity, cursor-not-allowed
  ✓ Loading: Spinner animation, text change

Form States:
  ✓ Pristine: Empty form, no errors
  ✓ Invalid: Shows error messages, submit disabled
  ✓ Valid: All fields correct, submit enabled
  ✓ Submitting: Loading state, no interaction
  ✓ Success: Confirmation message, redirect pending
  ✓ Error: Error message displayed, form still editable
```

---

## Animation Specifications

### Alert Messages
```
Entrance: fade-in + slide-in-from-top-2
Duration: 300ms
Effect: Messages appear smoothly at top of form
```

### Button Interactions
```
Hover: Gradient color shift
Duration: 200ms

Active (Click): Scale down to 95%
Duration: Immediate
Effect: Tactile feedback for user

Spinner (Loading): Rotating animation
Colors: white/30 and white (border-t)
Effect: Indicates processing
```

### Focus States
```
Focus Ring Animation: 200ms transition
Effect: Smooth border and ring appearance
Color: Theme-aware (orange or red)
```

### State Transitions
```
All transitions use: transition-all duration-200
Covers:
  - Color changes
  - Border styling
  - Shadow changes
  - Position/scale changes
```

---

## Error Message Examples

### Validation Errors
```
Supplier Name: "Supplier name is required"
Contact Person: "Contact person name is required"
Phone Number: "Please enter a valid phone number"
Email: "Please enter a valid email address"
Address: "Address is required"
```

### API Errors
```
"Failed to add supplier. Please try again."
(with retry option available)
```

### Success Message
```
"Supplier has been added successfully. Redirecting..."
(auto-redirects to staff page)
```

### Form Status
```
Warning: "⚠ Please fix the errors above before submitting"
(appears when user tries to submit invalid form)
```

---

## Layout Grid System

### Desktop Layout (1024px+)
```
┌─────────────────────────────────────┐
│  Header with Title and Logout       │
├─────────────────────────────────────┤
│                                     │
│  Page Header Section                │
│                                     │
│  ┌──────────────────────────────┐   │
│  │  Form Container              │   │
│  │                              │   │
│  │  Section 1: Supplier Info    │   │
│  │  ┌────────────────────────┐  │   │
│  │  │ [Supplier Name (full)] │  │   │
│  │  └────────────────────────┘  │   │
│  │                              │   │
│  │  Section 2: Contact Person   │   │
│  │  ┌──────────┐  ┌──────────┐  │   │
│  │  │ Contact  │  │  Phone   │  │   │
│  │  └──────────┘  └──────────┘  │   │
│  │                              │   │
│  │  Section 3: Additional Info  │   │
│  │  ┌──────────┐  ┌──────────┐  │   │
│  │  │  Email   │  │ Address  │  │   │
│  │  └──────────┘  └──────────┘  │   │
│  │                              │   │
│  │  [Add Supplier]  [Cancel]    │   │
│  └──────────────────────────────┘   │
│                                     │
└─────────────────────────────────────┘
```

### Mobile Layout (< 640px)
```
┌────────────────┐
│ Header         │
├────────────────┤
│                │
│ Page Header    │
│                │
│ ┌────────────┐ │
│ │Form        │ │
│ │            │ │
│ │ Section 1  │ │
│ │ ┌────────┐ │ │
│ │ │Field   │ │ │
│ │ └────────┘ │ │
│ │            │ │
│ │ Section 2  │ │
│ │ ┌────────┐ │ │
│ │ │Field 1 │ │ │
│ │ └────────┘ │ │
│ │ ┌────────┐ │ │
│ │ │Field 2 │ │ │
│ │ └────────┘ │ │
│ │            │ │
│ │ Section 3  │ │
│ │ ┌────────┐ │ │
│ │ │Field 1 │ │ │
│ │ └────────┘ │ │
│ │ ┌────────┐ │ │
│ │ │Field 2 │ │ │
│ │ └────────┘ │ │
│ │            │ │
│ │┌──────────┐│ │
│ ││ Add      ││ │
│ │└──────────┘│ │
│ │┌──────────┐│ │
│ ││ Cancel   ││ │
│ │└──────────┘│ │
│ └────────────┘ │
│                │
└────────────────┘
```

---

## Implementation Checklist

- ✅ Form validation implemented
- ✅ Real-time field validation on blur
- ✅ Error messages per field
- ✅ ARIA attributes added
- ✅ Dark mode styling
- ✅ Responsive design
- ✅ Accessibility compliance
- ✅ Loading states
- ✅ Success/error messaging
- ✅ Touch-friendly sizing
- ✅ Smooth animations
- ✅ Icon integration

---

**Design Document Version**: 1.0
**Last Updated**: November 11, 2025
**Compliance**: WCAG 2.1 AA, HCI Best Practices
