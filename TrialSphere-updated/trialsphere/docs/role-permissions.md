# TrialSphere role permissions

| Capability | Admin | Study Coordinator | Investigator |
|---|---:|---:|---:|
| View dashboard and directories | Yes | Yes | Yes |
| Create/update studies | Yes | Yes | No |
| Delete studies | Yes | No | No |
| Create/update sites | Yes | Yes | No |
| Delete sites | Yes | No | No |
| Create/update participants | Yes | Yes | Yes |
| Delete participants | Yes | Yes | No |

Role changes are intentionally not exposed in the demo UI. They can be managed by an administrator directly in the `User.role` database field until a user-administration module is added.
