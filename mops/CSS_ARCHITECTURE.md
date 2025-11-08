# 📝 CSS Architecture - Tailwind with Custom Classes

## Overview

The application now uses **Tailwind CSS with custom semantic classes** instead of inline utilities. All styles are defined in a centralized CSS file using Tailwind's `@apply` directive.

## 🎯 Benefits

### 1. **No Inline Classes**
- Clean, readable component code
- Semantic class names (`.form-input` instead of long utility lists)
- Better separation of concerns

### 2. **Maintainable**
- Change styles in one place
- Reusable across components
- Easy to update theme

### 3. **Type-Safe & Autocomplete**
- Class names defined in CSS
- Better IDE support
- Fewer typos

### 4. **Consistent Design**
- Standardized components
- Unified spacing, colors, and effects
- Design system approach

## 📁 File Structure

```
app/
├── globals.css          # Main CSS file with imports
├── components/
│   ├── styles.css       # Custom component classes
│   ├── CreateIncidentForm.tsx
│   ├── PhotoUpload.tsx
│   └── MapPicker.tsx
└── page.tsx
```

## 🎨 Custom Classes Defined

### Page Layout
```css
.page-container          /* Main page wrapper with gradient */
.page-content           /* Content container with max-width */
.page-header            /* Header section */
.page-title             /* Main page title */
.page-subtitle          /* Page subtitle */
```

### Form Container
```css
.incident-form          /* Main form container */
.incident-form-header   /* Form header section */
.incident-form-title    /* Form title */
.incident-form-subtitle /* Form subtitle */
```

### Form Fields
```css
.form-field             /* Field wrapper */
.form-label             /* Field label */
.form-label-required    /* Required asterisk */
.form-input             /* Text inputs */
.form-select            /* Select dropdowns */
.form-textarea          /* Text areas */
.form-error             /* Error messages */
.form-help-text         /* Help/hint text */
.form-info-box          /* Info boxes */
.form-loading-text      /* Loading indicators */
```

### Alerts
```css
.alert-success          /* Success message container */
.alert-success-icon     /* Success icon wrapper */
.alert-success-title    /* Success title */
.alert-success-text     /* Success message text */

.alert-error            /* Error message container */
.alert-error-icon       /* Error icon wrapper */
.alert-error-title      /* Error title */
.alert-error-text       /* Error message text */
```

### Buttons
```css
.btn-primary            /* Primary action button */
.btn-submit             /* Submit form button */
.btn-delete             /* Delete/remove button */
```

### Photo Upload
```css
.photo-upload-container /* Main container */
.photo-upload-controls  /* Upload button area */
.photo-counter          /* Photo count badge */
.photo-grid             /* Photo grid layout */
.photo-item             /* Individual photo container */
.photo-overlay          /* Hover overlay */
.photo-label            /* Photo label text */
```

### Map
```css
.map-container          /* Map wrapper */
```

### Utilities
```css
.spinner                /* Large loading spinner */
.spinner-small          /* Small loading spinner */
.submit-section         /* Submit button section */
```

## 📖 Usage Examples

### Before (Inline Tailwind)
```tsx
<button className="w-full py-4 px-6 bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold rounded-xl hover:from-green-700 hover:to-green-800 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-green-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
  Submit
</button>
```

### After (Semantic Classes)
```tsx
<button className="btn-submit">
  Submit
</button>
```

## 🔧 How It Works

### 1. Define Classes with @apply

**app/components/styles.css**:
```css
.form-input {
  @apply w-full px-4 py-3 border-2 border-gray-300 rounded-xl 
         focus:ring-2 focus:ring-green-500 focus:border-green-500 
         text-gray-900 placeholder-gray-500 transition-colors;
}
```

### 2. Import in globals.css

**app/globals.css**:
```css
@import "tailwindcss";
@import "leaflet/dist/leaflet.css";
@import "./components/styles.css";
```

### 3. Use in Components

**Component.tsx**:
```tsx
<input className="form-input" />
```

## 🎨 Color Palette (CSS Variables)

```css
--primary-green: #2D5F3F
--secondary-green: #4A7C59
--light-green: #E8F5E9
--accent-green: #66BB6A
--dark-green: #1B4332
```

## ✨ Features

### Consistent Spacing
- All form fields use `.form-field` for consistent spacing
- Standardized padding and margins
- Predictable layout

### Unified Colors
- Green theme throughout
- Consistent hover states
- Matching focus rings

### Smooth Transitions
- All interactive elements have transitions
- Consistent animation durations
- Professional feel

### Accessibility
- High contrast maintained
- Focus indicators on all interactive elements
- Semantic HTML with styled classes

## 🔄 Making Changes

### To Update a Style:
1. Open `app/components/styles.css`
2. Find the class (e.g., `.form-input`)
3. Modify the `@apply` directive
4. Changes apply to all components using that class

### Example: Change Input Border Color
```css
/* Before */
.form-input {
  @apply ... border-gray-300 ...;
}

/* After */
.form-input {
  @apply ... border-green-300 ...;
}
```

All inputs across the app will update automatically!

## 📊 Component Mapping

| Component | Classes Used |
|-----------|--------------|
| **Page** | `page-container`, `page-content`, `page-header`, `page-title`, `page-subtitle` |
| **Form** | `incident-form`, `incident-form-header`, `incident-form-title`, `form-field`, `form-label`, `form-input`, `form-textarea`, `form-select` |
| **Photos** | `photo-upload-container`, `photo-grid`, `photo-item`, `btn-primary`, `btn-delete` |
| **Map** | `map-container` |
| **Alerts** | `alert-success`, `alert-error`, `alert-*-icon`, `alert-*-title` |
| **Submit** | `submit-section`, `btn-submit`, `spinner` |

## 🚀 Advantages Over Inline

1. **Readability**: Component JSX is cleaner and easier to understand
2. **Reusability**: Same class across multiple components
3. **Maintainability**: Update in one place, applies everywhere
4. **Performance**: Smaller HTML output
5. **Design System**: Built-in component library
6. **Type Safety**: Easy to spot typos in class names

## 💡 Best Practices

1. **Use Semantic Names**: `btn-primary` not `green-button`
2. **Group Related Styles**: All form elements together
3. **Document Classes**: Keep this file updated
4. **Stay Consistent**: Use defined classes, avoid one-offs
5. **Test Changes**: Update affects all instances

## 🎯 Result

Clean, maintainable, and professional CSS architecture using Tailwind's best practices with the convenience of reusable semantic classes! 🎨✨

