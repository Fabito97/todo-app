#!/bin/bash
echo "Creating Phase 1 issues..."
i1=$(gh issue create --title "Phase 1: Init Backend Server" --body "Initialize the Node.js/Express server in app/server. Setup in-memory stores for users and tasks." < /dev/null)
echo "1|$i1"

i2=$(gh issue create --title "Phase 1: Implement API endpoints" --body "Implement CRUD API endpoints (GET /api/users, POST /api/tasks, PUT /api/tasks/:id, etc.)." < /dev/null)
echo "2|$i2"

i3=$(gh issue create --title "Phase 1: Validate API" --body "Start the server and test API routes via curl or a manual REST client script." < /dev/null)
echo "3|$i3"

echo "Creating Phase 2 issues..."
i4=$(gh issue create --title "Phase 2: Init React Frontend" --body "Initialize a React application using Vite in app/client." < /dev/null)
echo "4|$i4"

i5=$(gh issue create --title "Phase 2: Configure API Service" --body "Configure Vite proxy to point to the backend and build basic fetching utility/service." < /dev/null)
echo "5|$i5"

i6=$(gh issue create --title "Phase 2: Validate Frontend Proxy" --body "Run the frontend server, ensure it starts cleanly, and test the API proxy." < /dev/null)
echo "6|$i6"

echo "Creating Phase 3 issues..."
i7=$(gh issue create --title "Phase 3: Parent Portal - Manage Kids" --body "Create the UI to add Kid accounts and fetch the list of existing kids." < /dev/null)
echo "7|$i7"

i8=$(gh issue create --title "Phase 3: Parent Portal - Assign Tasks" --body "Create the UI to assign tasks (ad-hoc and recurring)." < /dev/null)
echo "8|$i8"

i9=$(gh issue create --title "Phase 3: Parent Portal - Dashboard" --body "Implement the Progress Dashboard showing completed vs. pending tasks." < /dev/null)
echo "9|$i9"

i10=$(gh issue create --title "Phase 3: Validate Parent Flow" --body "Use the browser tool or manual testing to mock the parent flow (create kid -> assign task -> view dashboard)." < /dev/null)
echo "10|$i10"

echo "Creating Phase 4 issues..."
i11=$(gh issue create --title "Phase 4: Kid Portal - View Tasks" --body "Create the Kid view highlighting their assigned tasks mapping to the backend." < /dev/null)
echo "11|$i11"

i12=$(gh issue create --title "Phase 4: Kid Portal - Complete Tasks" --body "Add functionality for kids to mark tasks as complete, sending a PUT to the backend." < /dev/null)
echo "12|$i12"

i13=$(gh issue create --title "Phase 4: Validate Kid Flow" --body "Select a kid's profile, mark a task done, verify UI updates, and verify Parent Dashboard updates." < /dev/null)
echo "13|$i13"
