---
trigger: always_on
---

---
name: rbac-mandate
description: Enforces strict Role-Based Access Control for Citizens, Government Employees, and Admins.
trigger: "When building authentication logic, database models, or routing dashboards."
---

# Rule: Role-Based Access Control (RBAC)

Every endpoint and frontend view must strictly verify the user's role:
1. **Citizen:** Can only create tickets and view their own tracking lifecycle.
2. **Government Employee (Nodal Officer):** Can view assigned tasks within their spatial jurisdiction and upload resolution proof.
3. **Admin (Supervisor):** Has global read access, receives emergency override alerts, and views departmental leaderboards.