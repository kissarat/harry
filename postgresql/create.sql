DROP DATABASE IF EXISTS "evart";
CREATE USER "evart"
  PASSWORD 'evart';
CREATE DATABASE "evart" OWNER "evart";

CREATE SCHEMA meta;
ALTER SCHEMA meta OWNER TO "evart";
