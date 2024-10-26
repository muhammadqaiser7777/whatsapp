<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Status;
use Carbon\Carbon;

class DeleteOldStatuses extends Command
{
    protected $signature = 'statuses:cleanup';
    protected $description = 'Delete statuses older than 24 hours';

    public function __construct()
    {
        parent::__construct();
    }

    public function handle()
    {
        $cutoff = Carbon::now()->subHours(24);

        $deletedCount = Status::where('created_at', '<', $cutoff)->delete();

        $this->info("Deleted $deletedCount old statuses.");
    }
}
