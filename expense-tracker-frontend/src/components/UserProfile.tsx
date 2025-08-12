import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/apiService';
import { User, UserPreferences } from '../types/User';
import { ExpenseCategory } from '../types/ExpenseCategory';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Switch } from './ui/switch';
import { Alert, AlertDescription } from './ui/alert';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Separator } from './ui/separator';
import {
  User as UserIcon,
  Edit,
  Settings,
  Save,
  X,
  Mail,
  Calendar,
  LogOut,
  ShieldCheck,
  Loader2
} from 'lucide-react';

export const UserProfile: React.FC = () => {
  const { user, updateUser, nuclearLogout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<User>>(user || {});
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!user) {
    return (
      <div className="container max-w-4xl mx-auto py-8">
        <div className="flex justify-center items-center min-h-[50vh]">
          <Loader2 className="h-16 w-16 animate-spin" />
        </div>
      </div>
    );
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      const updatedUser = await apiService.updateUserProfile(editForm);
      updateUser(updatedUser);
      setIsEditing(false);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update profile. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreferencesUpdate = async (field: keyof UserPreferences, value: any) => {
    try {
      const updatedPreferences = await apiService.updateUserPreferences({
        [field]: value
      });
      updateUser({
        ...user,
        preferences: { ...(user.preferences || {}), ...updatedPreferences }
      });
      setMessage({ type: 'success', text: 'Preferences updated!' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update preferences.' });
    }
  };

  return (
    <div className="container max-w-6xl mx-auto py-8 space-y-8">
      {/* Header */}
      <Card>
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex items-center gap-6">
              <Avatar className="h-20 w-20 text-2xl">
                <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                  {user.firstName?.[0] || user.username?.[0] || 'U'}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-3xl font-bold text-primary mb-2">
                  {user.firstName && user.lastName 
                    ? `${user.firstName} ${user.lastName}` 
                    : user.username
                  }
                </h1>
                <p className="text-muted-foreground">
                  Manage your account information and preferences
                </p>
              </div>
            </div>
            <Badge 
              variant={user.emailVerified ? 'default' : 'secondary'}
              className="flex items-center gap-2 px-4 py-2"
            >
              {user.emailVerified ? <ShieldCheck className="h-4 w-4" /> : <Mail className="h-4 w-4" />}
              {user.emailVerified ? 'Email Verified' : 'Email Not Verified'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Messages */}
      {message && (
        <Alert variant={message.type === 'error' ? 'destructive' : 'default'}>
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Information */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <UserIcon className="h-5 w-5" />
                  Profile Information
                </CardTitle>
                {!isEditing && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setIsEditing(true);
                      setEditForm(user);
                    }}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">

              {isEditing ? (
                <form onSubmit={handleEditSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        value={editForm.firstName || ''}
                        onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        value={editForm.lastName || ''}
                        onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="submit"
                      disabled={isLoading}
                    >
                      {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                      {isLoading ? 'Saving...' : 'Save Changes'}
                    </Button>
                    <Button
                      variant="outline"
                      type="button"
                      onClick={() => setIsEditing(false)}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label className="text-sm text-muted-foreground">Username</Label>
                    <p className="flex items-center gap-2 mt-1">
                      <UserIcon className="h-4 w-4 text-muted-foreground" />
                      {user.username}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Email</Label>
                    <p className="flex items-center gap-2 mt-1">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      {apiService.maskEmail(user.email)}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">First Name</Label>
                    <p className="mt-1">{user.firstName || 'Not set'}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Last Name</Label>
                    <p className="mt-1">{user.lastName || 'Not set'}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Member Since</Label>
                    <p className="flex items-center gap-2 mt-1">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Last Login</Label>
                    <p className="flex items-center gap-2 mt-1">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : 'Unknown'}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Preferences */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Preferences
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Separator className="mb-6" />
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="currency">Currency</Label>
                  <Select
                    value={user.preferences?.currency || 'USD'}
                    onValueChange={(value) => handlePreferencesUpdate('currency', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                      <SelectItem value="GBP">GBP (£)</SelectItem>
                      <SelectItem value="INR">INR (₹)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="dateFormat">Date Format</Label>
                  <Select
                    value={user.preferences?.dateFormat || 'MM/DD/YYYY'}
                    onValueChange={(value) => handlePreferencesUpdate('dateFormat', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select date format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MM/dd/yyyy">MM/dd/yyyy</SelectItem>
                      <SelectItem value="dd/MM/yyyy">dd/MM/yyyy</SelectItem>
                      <SelectItem value="yyyy-MM-dd">yyyy-MM-dd</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="defaultCategory">Default Category</Label>
                  <Select
                    value={user.preferences?.defaultCategory || 'FOOD'}
                    onValueChange={(value) => handlePreferencesUpdate('defaultCategory', value as ExpenseCategory)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(ExpenseCategory).map((category) => (
                        <SelectItem key={category} value={category}>
                          {category.replace('_', ' ')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="theme">Theme</Label>
                  <Select
                    value={user.preferences?.theme || 'light'}
                    onValueChange={(value) => handlePreferencesUpdate('theme', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select theme" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="auto">Auto</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="notifications"
                    checked={user.preferences?.enableNotifications || false}
                    onCheckedChange={(checked) => handlePreferencesUpdate('enableNotifications', checked)}
                  />
                  <Label htmlFor="notifications">Enable email notifications for expense reminders</Label>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Debug/Testing Section - Remove in production */}
      <Card className="border-orange-200 bg-orange-50">
        <CardHeader>
          <CardTitle className="text-orange-800">
            🧪 Logout Testing (Debug)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-orange-700 mb-4">
            Use these options if you're experiencing SSO session issues when switching between users:
          </p>
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={nuclearLogout}
              className="border-orange-600 text-orange-800 hover:bg-orange-100"
            >
              <LogOut className="h-4 w-4 mr-2" />
              🚀 Nuclear Logout
            </Button>
            <span className="text-orange-600 text-sm">
              (Forces complete session termination + cookie clearing)
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};