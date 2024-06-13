"use client";
import React from 'react'
import { NavigateNextTwoTone } from '@mui/icons-material'
import { Breadcrumbs, Link, Typography } from '@mui/material'
import { usePathname } from 'next/navigation'
import { routes } from '@/paths';

const findRoute = (pathSegments: string[]) => {
  return routes.find(route => {
    const routeSegments = route.path.split('/').filter(segment => segment);
    if (routeSegments.length !== pathSegments.length) return false;
    return routeSegments.every((segment, index) => {
      return segment.startsWith(':') || segment === pathSegments[index];
    });
  });
};

const Breadcrumb = () => {
  const paths = usePathname();
  const pathNames = paths.split('/').filter(path => path);

  return (
    <Breadcrumbs separator={<NavigateNextTwoTone fontSize="small" />}>
      <Link underline="hover" color="inherit" href="/manager/"> Invoicer </Link>

      {pathNames.map((_, index) => {
        const pathSegments = pathNames.slice(0, index + 1);
        const path = `/${pathSegments.join('/')}`;
        const route = findRoute(pathSegments);

        if (path == "/manager") return null;
        if (!route) return null;

        const isActive = pathNames.length === pathSegments.length;

        return !isActive ? (
          <Link underline="hover" color="inherit" href={path} key={route.name}>
            {route.label}
          </Link>
        ) : (
          <Typography color="text.primary" key={route.name}>{route.label}</Typography>
        );
      })}
    </Breadcrumbs>
  );
};


export default Breadcrumb