import { useState } from "react";
import "./ProfileChooser.css";

export default function ProfileChooser({
  profiles,
  accounts,
  accountName,
  accountEmail,
  error,
  onProfilesChange,
  onSelectProfile,
  onAddAccount,
  onSelectAccount,
  onRemoveAccount,
}) {
  const [editing, setEditing] = useState(false);
  const [profileName, setProfileName] = useState("");
  const [isKid, setIsKid] = useState(false);
  const [editingProfileId, setEditingProfileId] = useState(null);
  const [accountToRemove, setAccountToRemove] = useState(null);
  function startEditingProfile(profile) {
    setEditingProfileId(profile.id);
    setProfileName(profile.name);
    setIsKid(profile.isKid);
  }

  function clearForm() {
    setEditingProfileId(null);
    setProfileName("");
    setIsKid(false);
  }

  function saveProfile(event) {
    event.preventDefault();
    const name = profileName.trim();
    if (!name || !editingProfileId) return;

    onProfilesChange(
      profiles.map((profile) =>
        profile.id === editingProfileId
          ? { ...profile, name, isKid }
          : profile
      )
    );
    clearForm();
  }

  function removeProfile(profileId) {
    if (profiles.length <= 1) return;
    onProfilesChange(profiles.filter((profile) => profile.id !== profileId));
    if (editingProfileId === profileId) clearForm();
  }

  return (
    <main className="profile-chooser">
      <a className="profile-chooser-brand" href="#home" aria-label="StreamHub">
        <span aria-hidden="true">▶</span> StreamHub
      </a>

      <header className="profile-chooser-heading">
        <p className="profile-chooser-eyebrow">STREAMHUB</p>
        <h1>Who&apos;s watching?</h1>
        <p>Choose a profile for {accountName}.</p>
      </header>

      <button
        className="profile-edit-toggle"
        type="button"
        onClick={() => {
          setEditing((value) => !value);
          clearForm();
        }}
        aria-pressed={editing}
      >
        {editing ? "Done" : "✎ Edit profiles"}
      </button>

      <section className="profile-chooser-list" aria-label="Viewer profiles">
        {profiles
          .filter((profile) => profile.id !== "main")
          .map((profile, index) => (
          <div className="profile-chooser-item" key={profile.id}>
            <button
              className={`profile-choice-avatar profile-avatar-color-${index % 5}`}
              type="button"
              onClick={() => !editing && onSelectProfile(profile)}
              disabled={editing}
              aria-label={`Watch as ${profile.name}${profile.isKid ? ", Kids profile" : ""}`}
            >
              {profile.isKid ? (
                <span className="profile-kids-mark">KIDS</span>
              ) : (
                <span aria-hidden="true">{profile.name.trim().charAt(0).toUpperCase()}</span>
              )}
            </button>
            <span className="profile-choice-name">{profile.name}</span>
            {editing && (
              <div className="profile-choice-actions">
                <button type="button" onClick={() => startEditingProfile(profile)}>
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => removeProfile(profile.id)}
                  disabled={profiles.length <= 1}
                  aria-label={`Remove ${profile.name}`}
                >
                  Remove
                </button>
              </div>
            )}
          </div>
        ))}

        {accounts.map((account, index) => {
          const isCurrentAccount =
            account.email.trim().toLowerCase() ===
            accountEmail.trim().toLowerCase();
          return (
            <div className="profile-chooser-item" key={`account-${account.email}`}>
              <button
                className={`profile-choice-avatar profile-avatar-color-${(profiles.length + index) % 5}`}
                type="button"
                onClick={() => !editing && onSelectAccount(account)}
                disabled={editing}
                aria-label={`Sign in as ${account.name}`}
                title={account.email}
              >
                <span aria-hidden="true">
                  {account.name.trim().charAt(0).toUpperCase()}
                </span>
              </button>
              <span className="profile-choice-name">{account.name}</span>
              {editing && (
                <div className="profile-choice-actions">
                  <button
                    type="button"
                    onClick={() => setAccountToRemove(account)}
                    aria-label={`Remove account ${account.name}`}
                  >
                    Remove
                  </button>
                  {isCurrentAccount && (
                    <span className="profile-current-account">Current</span>
                  )}
                </div>
              )}
            </div>
          );
        })}

        <button
          className="profile-add-choice"
          type="button"
          onClick={onAddAccount}
        >
          <span className="profile-add-icon" aria-hidden="true">+</span>
          <span>Add account</span>
        </button>
      </section>

      {editingProfileId && (
        <form className="profile-editor" onSubmit={saveProfile}>
          <h2>Edit profile</h2>
          <label htmlFor="profile-name">Profile name</label>
          <input
            id="profile-name"
            type="text"
            value={profileName}
            onChange={(event) => setProfileName(event.target.value)}
            maxLength={24}
            required
            autoComplete="off"
          />
          <label className="profile-kids-option">
            <input
              type="checkbox"
              checked={isKid}
              onChange={(event) => setIsKid(event.target.checked)}
            />
            <span>This is a Kids profile</span>
          </label>
          <div className="profile-editor-actions">
            <button type="submit" disabled={!profileName.trim()}>Save changes</button>
            <button type="button" onClick={clearForm}>Cancel</button>
          </div>
        </form>
      )}

      {accountToRemove && (
        <div className="account-removal-overlay">
          <section
            className="account-removal-dialog"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="account-removal-title"
            aria-describedby="account-removal-description"
          >
            <h2 id="account-removal-title">Remove this account?</h2>
            <p id="account-removal-description">
              <strong>{accountToRemove.name}</strong> will be signed out and
              removed from this browser, along with its saved profiles. This
              does not delete the StreamHub account.
            </p>
            <div className="account-removal-actions">
              <button
                type="button"
                onClick={() => setAccountToRemove(null)}
              >
                Cancel
              </button>
              <button
                className="account-removal-confirm"
                type="button"
                onClick={() => {
                  onRemoveAccount(accountToRemove);
                  setAccountToRemove(null);
                }}
              >
                Remove account
              </button>
            </div>
          </section>
        </div>
      )}

      {error && <p className="profile-chooser-error" role="alert">{error}</p>}
    </main>
  );
}
