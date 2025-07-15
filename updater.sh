#!/bin/bash
# Run with: sh updater.sh
echo "Updating from CassidySpectra like a pro..."
echo "WARNING: This pulls from https://github.com/lianecagara/CassidySpectra."
echo "1. Unrelated histories might merge if your local repo has no shared past. Could get messy."
echo "2. Merge conflicts might happen. If they do, check files for '<<<<<<<' markers."
echo "   - Fix: Edit files, remove markers, then 'git add <file>' and 'git commit'."
echo "   - To quit: Type 'abort' when paused."
echo "Proceed? (y/n)"
read -r response
if [ "$response" = "y" ] || [ "$response" = "Y" ]; then
    while true; do
        git pull --no-ff --no-commit --allow-unrelated-histories https://github.com/lianecagara/CassidySpectra
        if [ $? -eq 0 ]; then
            echo "Pulled clean. You’re good. (Uncommitted changes left to review.)"
            break
        else
            echo "Fuck, merge conflict or error. Check files for '<<<<<<<' markers."
            echo "Fix them, then 'git add' and 'git commit'. Ready to continue? (y/n/abort)"
            read -r retry
            if [ "$retry" = "abort" ]; then
                echo "Aborted. Fix your shit manually."
                exit 1
            elif [ "$retry" = "y" ] || [ "$retry" = "Y" ]; then
                echo "Checking again..."
                continue
            else
                echo "Pausing. Fix conflicts, then type 'y' to retry or 'abort' to quit."
            fi
        fi
    done
else
    echo "Paused. No changes pulled yet. Run again when ready."
fi