/* One sound at a time. A video that gets its sound turned on claims the bus, and the player fades out and waits.
   When the last claim is released the player comes back. Pressing play on the player asks every video to go quiet. */
export const bus = {
  claims: new Set(),
  onFirstClaim: null,
  onLastRelease: null,
  onTakeover: null,
  claim(token) {
    if (this.claims.has(token)) return;
    const was = this.claims.size;
    this.claims.add(token);
    if (!was && this.onFirstClaim) this.onFirstClaim();
  },
  release(token) {
    if (!this.claims.delete(token)) return;
    if (!this.claims.size && this.onLastRelease) this.onLastRelease();
  },
  takeover() { if (this.onTakeover) this.onTakeover(); },
};
