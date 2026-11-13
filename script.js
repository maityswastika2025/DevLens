
const searchButton = document.getElementById("searchBtn");
const usernameInput = document.getElementById("username");
const profileSection = document.getElementById("profile");

searchButton.addEventListener("click", async function () {

    const username = usernameInput.value.trim();

    if (username === "") {
        alert("Please enter a GitHub username!");
        return;
    }

    const url = `https://api.github.com/users/${username}`;

    profileSection.textContent = "Loading profile...";
    searchButton.disabled = true;

    try {
        // Fetch GitHub profile
        const response = await fetch(url);
        const data = await response.json();

        if (!response.ok) {
            if (response.status === 404) {
                throw new Error("GitHub user not found. Please check the username.");
            } else if (response.status === 403) {
                throw new Error("GitHub API rate limit reached. Please try again later.");
            } else {
                throw new Error("Unable to fetch GitHub profile. Please try again.");
            }
        }

        // Create profile card
        profileSection.innerHTML = `
            <div class="profile-card">
                <img id="avatar" alt="Profile picture">
                <h2 id="name"></h2>
                <p id="bio"></p>

                <div class="profile-stats">
                    <div class="stat-box">
                        <h3 id="followers"></h3>
                        <p>Followers</p>
                    </div>

                    <div class="stat-box">
                        <h3 id="following"></h3>
                        <p>Following</p>
                    </div>

                    <div class="stat-box">
                        <h3 id="repos"></h3>
                        <p>Repositories</p>
                    </div>
                </div>
            </div>
        `;

        // Display profile information
        document.getElementById("avatar").src = data.avatar_url;
        document.getElementById("name").textContent = data.name || data.login;
        document.getElementById("bio").textContent = data.bio || "No bio available";
        document.getElementById("followers").textContent = data.followers;
        document.getElementById("following").textContent = data.following;
        document.getElementById("repos").textContent = data.public_repos;

        // Fetch recent repositories
        const repoResponse = await fetch(
            `https://api.github.com/users/${username}/repos?sort=updated&per_page=5`
        );

        if (!repoResponse.ok) {
            throw new Error("Profile loaded, but repositories could not be loaded.");
        }

        const repositories = await repoResponse.json();

        // Calculate total stars
        const totalStars = repositories.reduce(function (total, repo) {
            return total + repo.stargazers_count;
        }, 0);

        // Calculate total forks
        const totalForks = repositories.reduce(function (total, repo) {
            return total + repo.forks_count;
        }, 0);

        // Count programming languages
        const languageCounts = {};

        repositories.forEach(function (repo) {
            if (repo.language) {
                if (languageCounts[repo.language]) {
                    languageCounts[repo.language]++;
                } else {
                    languageCounts[repo.language] = 1;
                }
            }
        });

        const profileCard = document.querySelector(".profile-card");

        // Recent repositories heading
        const repoHeading = document.createElement("h3");
        repoHeading.textContent = "Recent Repositories";
        profileCard.appendChild(repoHeading);

        // Display stars and forks
        const stats = document.createElement("p");

        stats.textContent =
            "Total Stars: " + totalStars +
            " | Total Forks: " + totalForks;

        const statsContainer = document.createElement("div");
        statsContainer.className = "stats-container";
        statsContainer.appendChild(stats);
        profileCard.appendChild(statsContainer);

        // Language distribution
        const languageHeading = document.createElement("h3");
        languageHeading.textContent = "Language Distribution";
        profileCard.appendChild(languageHeading);

        const languageInfo = document.createElement("p");

        languageInfo.textContent = Object.entries(languageCounts)
            .map(function ([language, count]) {
                return language + ": " + count;
            })
            .join(" | ") || "No language data available";

        profileCard.appendChild(languageInfo);

        // Display repository details
        repositories.forEach(function (repo) {

            const repoItem = document.createElement("div");
            repoItem.className = "repo-item";

            const repoName = document.createElement("a");
            repoName.textContent = repo.name;
            repoName.href = repo.html_url;
            repoName.target = "_blank";
            repoName.rel = "noopener noreferrer";

            const description = document.createElement("p");
            description.textContent =
                repo.description || "No description available";

            const repoInfo = document.createElement("p");

            repoInfo.textContent =
                "Language: " + (repo.language || "Not specified") +
                " | Stars: " + repo.stargazers_count;

            repoItem.appendChild(repoName);
            repoItem.appendChild(description);
            repoItem.appendChild(repoInfo);

            profileCard.appendChild(repoItem);
        });

    } catch (error) {
        console.error(error);
        profileSection.textContent = error.message;
    }

    finally {
        searchButton.disabled = false;
    }

});

// Search when Enter key is pressed
usernameInput.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
        searchButton.click();
    }
});
