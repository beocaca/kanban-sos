# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

This is a React-based Kanban board application demonstrating Atlassian's Pragmatic Drag and Drop library. The project is structured as a CodeSandbox example showcasing advanced drag-and-drop functionality with accessibility features.

## Development Commands

Since this is a CodeSandbox project, development typically happens within the sandbox environment. However, if running locally:

- **Start development**: Use CodeSandbox or a React development server
- **Template**: Create React App with TypeScript (`sandbox.config.json` specifies `create-react-app-typescript`)

## Architecture

### Core Structure

- **Entry Point**: `index.tsx` - Renders the main application wrapped in `AppProvider`
- **Main Component**: `example.tsx` - Contains the complete Kanban board implementation
- **Component Library**: Uses Atlassian Design System components (`@atlaskit/*`)

### Key Components

The application follows a hierarchical component structure:

1. **BoardExample** (`example.tsx`) - Root component managing board state and drag operations
2. **Board** - Layout container for columns
3. **Column** - Individual board columns with drag/drop functionality
4. **Card** - Individual task cards within columns

### State Management

- **Board State**: Centralized in `BoardExample` component using React's `useState`
- **Data Structure**: `ColumnMap` containing columns with ordered items
- **Registry Pattern**: Element registration system for drag operations in `registry.ts`
- **Context**: `BoardContext` provides state and operations to child components

### Drag and Drop Implementation

Built with Atlassian's Pragmatic Drag and Drop:

- **Operations**: Column reordering, card reordering within columns, cross-column card movement
- **Accessibility**: Live region announcements and keyboard support
- **Visual Feedback**: Post-move flash animations using `triggerPostMoveFlash`
- **Hit Detection**: Edge-based drop targeting with visual indicators

### Data Layer

- **Mock Data**: `pragmatic-drag-and-drop/documentation/examples/data/people/`
- **Person Type**: User objects with `userId`, `name`, `role`, `avatarUrl`
- **Avatar System**: Statically imported avatar images for CodeSandbox compatibility

### Component Communication

- **BoardContext**: Provides drag operations and element registration
- **Registry System**: Tracks DOM elements for visual feedback
- **Event Monitoring**: Global drag operation monitoring with instance isolation

## Key Dependencies

- **React 18**: Core framework
- **@atlaskit/pragmatic-drag-and-drop**: Drag and drop functionality
- **@atlaskit/design-system**: UI components (Button, Dropdown, Avatar, etc.)
- **tiny-invariant**: Runtime assertions
- **styled-components**: CSS-in-JS styling

## Development Notes

- Avatar imports are explicitly written out for CodeSandbox static analysis
- Instance isolation using symbols to prevent cross-component interference
- Stable mock data generation (no randomness for VR test compatibility)
- Accessibility-first approach with comprehensive ARIA support