
import { useState } from "react";
import "./ProfileSelection.css";

const initialProfiles = [
    { id: 1, name: "Main Profile", avatar: "👩🏻", kids: false },
    { id: 2, name: "Family", avatar: "👨🏻", kids: false },
    { id: 3, name: "Kids", avatar: "🧒🏻", kids: true },
];

export default function ProfileSelection({
    user,
    onSelectProfile,
}) {
    const [profiles, setProfiles] = useState(initialProfiles);
    const [manage, setManage] = useState(false);
    const [adding, setAdding] = useState(false);
    const [newName, setNewName] = useState("");

    function addProfile() {
        const name = newName.trim();
        if (!name) return;

        setProfiles((previous) => [
            ...previous,
            {
                id: Date.now(),
                name,
                avatar: "🧑🏻",
                kids: false,
            },
        ]);

        setNewName("");
        setAdding(false);
    }

    function deleteProfile(id) {
        if (profiles.length <= 1) return;
        setProfiles((previous) =>
            previous.filter((profile) => profile.id !== id)
        );
    }

    return (
        <div className="profile-screen">
            <header className="profile-header">
                <h1>STREAM<span>HUB</span></h1>
                <p>One account. Everyone's entertainment.</p>
            </header>

            <section className="profile-content">
                <h2>
                    {manage ? "Manage Profiles" : "Who's Watching?"}
                </h2>
                <p className="profile-subtitle">
                    {manage
                        ? "Manage your viewing profiles"
                        : "Choose a profile to continue"}
                </p>

                <div className="profile-grid">
                    {profiles.map((profile) => (
                        <div className="profile-item" key={profile.id}>
                            <button
                                className="profile-avatar"
                                onClick={() =>
                                    !manage && onSelectProfile?.(profile)
                                }
                                type="button"
                            >
                                {profile.avatar}
                                {profile.kids && (
                                    <span className="kids-tag">KIDS</span>
                                )}
                            </button>

                            <p>{profile.name}</p>

                            {manage && (
                                <button
                                    className="profile-delete"
                                    onClick={() => deleteProfile(profile.id)}
                                    type="button"
                                >
                                    Delete
                                </button>
                            )}
                        </div>
                    ))}

                    {!manage && (
                        <button
                            className="profile-add"
                            onClick={() => setAdding(true)}
                            type="button"
                        >
                            <span>+</span>
                            Add Profile
                        </button>
                    )}
                </div>

                {adding && (
                    <div className="profile-add-form">
                        <input
                            value={newName}
                            onChange={(event) =>
                                setNewName(event.target.value)
                            }
                            placeholder="Enter profile name"
                            maxLength={40}
                        />
                        <button onClick={addProfile}>Create</button>
                        <button onClick={() => setAdding(false)}>
                            Cancel
                        </button>
                    </div>
                )}

                <button
                    className="profile-manage"
                    onClick={() => setManage(!manage)}
                    type="button"
                >
                    {manage ? "Done" : "Manage Profiles"}
                </button>
            </section>

            <footer className="profile-footer">
                Welcome {user?.full_name || "to StreamHub"}
            </footer>
        </div>
    );
}
