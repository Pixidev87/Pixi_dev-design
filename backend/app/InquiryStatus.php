<?php

namespace App;

enum InquiryStatus: string
{
    case New = 'new';
    case Processed = 'processed';
    case Sent = 'sent';
}
