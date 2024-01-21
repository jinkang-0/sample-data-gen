### Sample Data Generator

A sample data generator to assist development of Immigration Justice Project's user portal.

Takes advantage of Supabase Edge Functions to run functions with queries, using Deno and pgnet.

Deploy a specific function with Supabase CLI:
```
npx supabase functions deploy <FUNCTION_NAME> --project-ref=abcdefghijklmnopqrst
```
(replace the last bit with the part before .supabase.co in your supabase url)

or deploy all functions at once by omitting the function name.