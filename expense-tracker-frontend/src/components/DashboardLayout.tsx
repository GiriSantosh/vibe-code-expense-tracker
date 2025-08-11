import React, { useState } from 'react';
import { useLocation, useNavigate, Link as RouterLink, Outlet } from 'react-router-dom';
import {
  AppBar,
  Box,
  Breadcrumbs,
  CssBaseline,
  Divider,
  Drawer,
  IconButton,
  Link,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Avatar,
  Menu,
  MenuItem,
  useTheme,
  useMediaQuery,
  Badge,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Receipt as ReceiptIcon,
  Analytics as AnalyticsIcon,
  Person as PersonIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  NotificationsNone as NotificationsIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

const drawerWidth = 280;

interface NavigationItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path: string;
  category?: 'primary' | 'secondary';
}

const navigationItems: NavigationItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: <DashboardIcon />,
    path: '/dashboard',
    category: 'primary',
  },
  {
    id: 'expenses',
    label: 'Expenses',
    icon: <ReceiptIcon />,
    path: '/expenses',
    category: 'primary',
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: <AnalyticsIcon />,
    path: '/analytics',
    category: 'primary',
  },
  {
    id: 'profile',
    label: 'Profile',
    icon: <PersonIcon />,
    path: '/profile',
    category: 'secondary',
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: <SettingsIcon />,
    path: '/settings',
    category: 'secondary',
  },
];

const breadcrumbNameMap: { [key: string]: string } = {
  '/dashboard': 'Dashboard',
  '/expenses': 'Expenses',
  '/analytics': 'Analytics',
  '/profile': 'Profile',
  '/settings': 'Settings',
};

export const DashboardLayout: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    handleProfileMenuClose();
    await logout();
  };

  const isActive = (path: string) => location.pathname === path;

  // Generate breadcrumbs
  const pathnames = location.pathname.split('/').filter((x) => x);
  const breadcrumbs = pathnames.map((_, index) => {
    const to = `/${pathnames.slice(0, index + 1).join('/')}`;
    const label = breadcrumbNameMap[to] || pathnames[index];
    
    return {
      to,
      label,
      isLast: index === pathnames.length - 1,
    };
  });

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Logo/Brand */}
      <Box sx={{ p: 2 }}>
        <Box display="flex" alignItems="center" gap={1}>
          <Box
            sx={{
              width: 40,
              height: 40,
              backgroundColor: 'primary.main',
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Typography variant="h6" color="primary.contrastText" fontWeight="bold">
              ET
            </Typography>
          </Box>
          <Typography variant="h6" fontWeight="bold" color="text.primary">
            Expense Tracker
          </Typography>
        </Box>
      </Box>

      <Divider />

      {/* Navigation */}
      <Box sx={{ flexGrow: 1, px: 1, py: 2 }}>
        <List disablePadding>
          {navigationItems
            .filter((item) => item.category === 'primary')
            .map((item) => (
              <ListItem key={item.id} disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  component={RouterLink}
                  to={item.path}
                  selected={isActive(item.path)}
                  onClick={() => isMobile && setMobileOpen(false)}
                  sx={{
                    borderRadius: 2,
                    mx: 1,
                    '&.Mui-selected': {
                      backgroundColor: 'primary.main',
                      color: 'primary.contrastText',
                      '&:hover': {
                        backgroundColor: 'primary.dark',
                      },
                      '& .MuiListItemIcon-root': {
                        color: 'primary.contrastText',
                      },
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 40,
                      color: isActive(item.path) ? 'primary.contrastText' : 'text.secondary',
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{
                      fontSize: 14,
                      fontWeight: isActive(item.path) ? 600 : 500,
                    }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
        </List>

        <Box sx={{ mt: 4, mb: 2, mx: 2 }}>
          <Typography variant="caption" color="text.secondary" fontWeight={600}>
            ACCOUNT
          </Typography>
        </Box>

        <List disablePadding>
          {navigationItems
            .filter((item) => item.category === 'secondary')
            .map((item) => (
              <ListItem key={item.id} disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  component={RouterLink}
                  to={item.path}
                  selected={isActive(item.path)}
                  onClick={() => isMobile && setMobileOpen(false)}
                  sx={{
                    borderRadius: 2,
                    mx: 1,
                    '&.Mui-selected': {
                      backgroundColor: 'primary.main',
                      color: 'primary.contrastText',
                      '&:hover': {
                        backgroundColor: 'primary.dark',
                      },
                      '& .MuiListItemIcon-root': {
                        color: 'primary.contrastText',
                      },
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 40,
                      color: isActive(item.path) ? 'primary.contrastText' : 'text.secondary',
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{
                      fontSize: 14,
                      fontWeight: isActive(item.path) ? 600 : 500,
                    }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
        </List>
      </Box>

      {/* User Profile Section */}
      <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
        <Box display="flex" alignItems="center" gap={2}>
          <Avatar
            sx={{
              width: 40,
              height: 40,
              backgroundColor: 'primary.main',
            }}
          >
            {user?.firstName?.[0] || user?.username?.[0] || 'U'}
          </Avatar>
          <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
            <Typography
              variant="subtitle2"
              fontWeight={600}
              noWrap
              color="text.primary"
            >
              {user?.firstName && user?.lastName 
                ? `${user.firstName} ${user.lastName}` 
                : user?.username || 'User'}
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              noWrap
            >
              {user?.email ? `${user.email.substring(0, 3)}***@***.com` : 'user@example.com'}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      
      {/* App Bar */}
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          backgroundColor: 'background.paper',
          color: 'text.primary',
          boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1)',
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>

          {/* Breadcrumbs */}
          <Box sx={{ flexGrow: 1 }}>
            <Breadcrumbs aria-label="breadcrumb" sx={{ fontSize: '0.875rem' }}>
              <Link
                component={RouterLink}
                to="/dashboard"
                color="inherit"
                underline="hover"
              >
                Dashboard
              </Link>
              {breadcrumbs.map((breadcrumb, index) => (
                breadcrumb.isLast ? (
                  <Typography
                    key={breadcrumb.to}
                    color="text.primary"
                    fontSize="0.875rem"
                    fontWeight={500}
                  >
                    {breadcrumb.label}
                  </Typography>
                ) : (
                  <Link
                    key={breadcrumb.to}
                    component={RouterLink}
                    to={breadcrumb.to}
                    color="inherit"
                    underline="hover"
                  >
                    {breadcrumb.label}
                  </Link>
                )
              ))}
            </Breadcrumbs>
          </Box>

          {/* Toolbar Actions */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton color="inherit" size="small">
              <SearchIcon />
            </IconButton>
            
            <IconButton color="inherit" size="small">
              <Badge badgeContent={2} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>

            <IconButton
              onClick={handleProfileMenuOpen}
              size="small"
              sx={{ ml: 1 }}
            >
              <Avatar
                sx={{
                  width: 32,
                  height: 32,
                  backgroundColor: 'primary.main',
                }}
              >
                {user?.firstName?.[0] || user?.username?.[0] || 'U'}
              </Avatar>
            </IconButton>
          </Box>

          {/* Profile Menu */}
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleProfileMenuClose}
            onClick={handleProfileMenuClose}
            PaperProps={{
              sx: {
                mt: 1.5,
                minWidth: 200,
                '& .MuiAvatar-root': {
                  width: 24,
                  height: 24,
                  ml: -0.5,
                  mr: 1,
                },
              },
            }}
          >
            <MenuItem onClick={() => navigate('/profile')}>
              <PersonIcon fontSize="small" sx={{ mr: 1 }} />
              Profile
            </MenuItem>
            <MenuItem onClick={() => navigate('/settings')}>
              <SettingsIcon fontSize="small" sx={{ mr: 1 }} />
              Settings
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout}>
              <LogoutIcon fontSize="small" sx={{ mr: 1 }} />
              Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* Drawer */}
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        {/* Mobile drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
            },
          }}
        >
          {drawerContent}
        </Drawer>

        {/* Desktop drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
            },
          }}
          open
        >
          {drawerContent}
        </Drawer>
      </Box>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          backgroundColor: 'background.default',
          minHeight: '100vh',
        }}
      >
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
};