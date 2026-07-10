# ROOM v49 — Founder’s Note sticky fix

- Removed reveal transform from the sticky section ancestor
- Kept the sticky stage free of transforms
- Moved scroll-linked drift to an inner wrapper
- Founder’s Note remains 190vh

## v50 scroll timeline fix
- Question / Statement / Founder’s Note use a shared sticky stage and scroll-linked motion.
- Each photo and following text are handled as one visual-story timeline.
- Light transition progress is normalized by `section height - viewport height`.
- Blackout is active only during its short handoff window.
- ROOM uses its own normalized section travel, appears immediately after the handoff, and fully disappears before Ticket.
- Mobile particle convergence spreads farther horizontally.
