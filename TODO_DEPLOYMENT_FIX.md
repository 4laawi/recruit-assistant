# Vercel Deployment Fix Plan

## Issues Identified:

1. **Type Error in Navbar.tsx**: Framer-motion variants type incompatibility with ease property - FIXED
2. **Unused Variables**: Multiple ESLint warnings across various files
3. **React Hooks Warning**: Ref value change in useEffect cleanup

## Steps to Fix:

- [x] Fix framer-motion type error in Navbar.tsx
- [ ] Remove unused imports and variables in src/app/dashboard/layout.tsx (signOut)
- [ ] Remove unused imports and variables in src/app/dashboard/page.tsx (user, uploadedFileIds, topCandidate)
- [ ] Remove unused imports and variables in src/app/dashboard/reports/page.tsx (Loader2, AlertCircle, setStats)
- [ ] Remove unused imports and variables in src/app/dashboard/settings/page.tsx (Textarea, SettingsIcon, Phone, Building, error)
- [ ] Remove unused imports and variables in src/app/page.tsx (useTransform, AnimatePresence, progress, scrollY, isMockupVisible, scrollYProgress, scaleIn)
- [ ] Remove unused imports and variables in src/app/pricing/page.tsx (Separator, Users, Zap, Shield, Clock, Star, TrendingUp, Brain, Target, Phone, priceCounters)
- [ ] Remove unused imports and variables in src/lib/services/fallbacks.ts (NextResponse)
- [ ] Fix React hooks exhaustive deps warning in src/app/page.tsx
- [ ] Test build to ensure deployment readiness
- [ ] Verify all changes maintain functionality

## Files to Update:

- [x] src/components/Navbar.tsx (main type error) - COMPLETED
- [ ] src/app/dashboard/layout.tsx
- [ ] src/app/dashboard/page.tsx
- [ ] src/app/dashboard/reports/page.tsx
- [ ] src/app/dashboard/settings/page.tsx
- [ ] src/app/page.tsx
- [ ] src/app/pricing/page.tsx
- [ ] src/lib/services/fallbacks.ts
