import { createClient } from "@supabase/supabase-js";

const supStorageURL = "https://cxfluuggeeoujjwckzuu.supabase.co";

const supStorageKEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN4Zmx1dWdnZWVvdWpqd2NrenV1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTY3NjY0NzM3MSwiZXhwIjoxOTkyMjIzMzcxfQ.ixLwVu6SPILfaYGWzQJw76LeH8Bhfdkt6wPsQM_-Erc";

const supabase = createClient(supStorageURL, supStorageKEY);

export default supabase;
