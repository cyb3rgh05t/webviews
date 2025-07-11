<?php if ($result->fetchArray()): ?>
    <div class="card bg-dark text-white mt-4">
        <div class="card-header text-white d-flex justify-content-between align-items-center">
    <h5 class="mb-0">Sports Guide Events</h5>
    <?php if ($hasSelections): ?>
        <button type="button" class="btn btn-success" onclick="window.open('/api/sportsevents.php', '_blank')">Preview Sports Guide</button>
    <?php endif; ?>
</div>

        
        <div class="card-body">
            <table class="table text-white mb-0">
                <thead>
                    <tr>
                        <th>Sport</th>
                        <th>Country</th>
                        <th>League</th>
                        <th>League ID</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    <?php
                    $result->reset();
                    while ($row = $result->fetchArray(SQLITE3_ASSOC)): ?>
                        <tr>
                            <td><?php echo htmlspecialchars($row['sport']); ?></td>
                            <td><?php echo htmlspecialchars($row['country']); ?></td>
                            <td><?php echo htmlspecialchars($row['league']); ?></td>
                            <td><?php echo htmlspecialchars($row['league_id']); ?></td>
                            <td>
                                <button class="btn btn-danger btn-sm" onclick="deleteSelection(<?php echo $row['id']; ?>)">Delete</button>
                            </td>
                        </tr>
                    <?php endwhile; ?>
                </tbody>
            </table>
        </div>
    </div>
<?php else: ?>
    <div class="alert alert-info mt-4">No selections found.</div>
<?php endif; ?>
<script>
    document.querySelectorAll("button").forEach(button => {
        button.addEventListener("click", () => {
            button.blur();
        });
    });
</script>