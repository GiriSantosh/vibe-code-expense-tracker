# Shadcn UI Migration Guide

## Usage Rules
- **Always use MCP Shadcn server** for component installation and documentation
- **Never write Shadcn components manually** - use MCP server to install them
- **Check component docs** before implementing using `get-component-docs`

## Implementation Workflow
1. **Planning Phase:** Use MCP server to list available components
2. **Installation:** Use MCP server to install required components
3. **Documentation:** Check component docs for proper usage patterns
4. **Implementation:** Follow Shadcn patterns, not MUI patterns

## Migration Status (✅ = Complete, 🔄 = In Progress, ❌ = Not Started)
- ✅ **UserProfile.tsx** - Converted from MUI to Shadcn (Card, Input, Button, Select, etc.)
- ✅ **Auth Components** - LoginPage, SignupPage, AuthError, AuthLayout
- ✅ **UI Components** - Alert, Switch components added
- 🔄 **Dashboard Components** - Still using MUI charts and metrics
- ❌ **ExpenseForm** - Still uses MUI components
- ❌ **Settings Pages** - Mixed MUI/Shadcn usage

## Shadcn Components Installed
- Card, CardContent, CardHeader, CardTitle
- Button (with variants: default, outline, destructive)
- Input, Label
- Select, SelectContent, SelectItem, SelectTrigger, SelectValue  
- Switch
- Alert, AlertDescription, AlertTitle
- Badge, Avatar, AvatarFallback
- Separator

## Common Patterns
```typescript
// MUI → Shadcn Migration Examples
// OLD MUI:
<TextField label="Name" value={value} onChange={handleChange} />
// NEW Shadcn:
<Label htmlFor="name">Name</Label>
<Input id="name" value={value} onChange={handleChange} />

// OLD MUI:
<Button variant="contained" startIcon={<Icon />}>Text</Button>
// NEW Shadcn:  
<Button><Icon className="h-4 w-4 mr-2" />Text</Button>
```