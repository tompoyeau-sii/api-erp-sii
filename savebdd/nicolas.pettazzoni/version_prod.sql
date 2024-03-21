--
-- PostgreSQL database dump
--

-- Dumped from database version 16.0
-- Dumped by pg_dump version 16.0

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: postgres
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO postgres;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: postgres
--

COMMENT ON SCHEMA public IS '';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Accounts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Accounts" (
    id integer NOT NULL,
    first_name character varying(255) NOT NULL,
    name character varying(255) NOT NULL,
    username character varying(255) NOT NULL,
    password character varying(255) NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."Accounts" OWNER TO postgres;

--
-- Name: Accounts_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Accounts_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Accounts_id_seq" OWNER TO postgres;

--
-- Name: Accounts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Accounts_id_seq" OWNED BY public."Accounts".id;


--
-- Name: Associate_Jobs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Associate_Jobs" (
    associate_id integer NOT NULL,
    job_id integer NOT NULL,
    start_date timestamp with time zone,
    end_date timestamp with time zone,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."Associate_Jobs" OWNER TO postgres;

--
-- Name: Associate_Managers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Associate_Managers" (
    associate_id integer NOT NULL,
    manager_id integer NOT NULL,
    start_date timestamp with time zone NOT NULL,
    end_date timestamp with time zone,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."Associate_Managers" OWNER TO postgres;

--
-- Name: Associates; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Associates" (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    first_name character varying(255) NOT NULL,
    birthdate date NOT NULL,
    mail character varying(255) NOT NULL,
    graduation_id integer NOT NULL,
    gender_id integer NOT NULL,
    start_date date NOT NULL,
    end_date date,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."Associates" OWNER TO postgres;

--
-- Name: Associates_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Associates_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Associates_id_seq" OWNER TO postgres;

--
-- Name: Associates_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Associates_id_seq" OWNED BY public."Associates".id;


--
-- Name: Customers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Customers" (
    id integer NOT NULL,
    label character varying(255) NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."Customers" OWNER TO postgres;

--
-- Name: Customers_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Customers_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Customers_id_seq" OWNER TO postgres;

--
-- Name: Customers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Customers_id_seq" OWNED BY public."Customers".id;


--
-- Name: Fees; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Fees" (
    id integer NOT NULL,
    associate_id integer,
    mission_id integer,
    date date,
    label character varying(255),
    value double precision,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."Fees" OWNER TO postgres;

--
-- Name: Fees_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Fees_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Fees_id_seq" OWNER TO postgres;

--
-- Name: Fees_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Fees_id_seq" OWNED BY public."Fees".id;


--
-- Name: Genders; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Genders" (
    id integer NOT NULL,
    label character varying(255) NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."Genders" OWNER TO postgres;

--
-- Name: Genders_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Genders_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Genders_id_seq" OWNER TO postgres;

--
-- Name: Genders_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Genders_id_seq" OWNED BY public."Genders".id;


--
-- Name: Graduations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Graduations" (
    id integer NOT NULL,
    label character varying(255) NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."Graduations" OWNER TO postgres;

--
-- Name: Graduations_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Graduations_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Graduations_id_seq" OWNER TO postgres;

--
-- Name: Graduations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Graduations_id_seq" OWNED BY public."Graduations".id;


--
-- Name: Jobs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Jobs" (
    id integer NOT NULL,
    label character varying(255) NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."Jobs" OWNER TO postgres;

--
-- Name: Jobs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Jobs_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Jobs_id_seq" OWNER TO postgres;

--
-- Name: Jobs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Jobs_id_seq" OWNED BY public."Jobs".id;


--
-- Name: Missions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Missions" (
    id integer NOT NULL,
    label character varying(255) NOT NULL,
    associate_id integer NOT NULL,
    project_id integer NOT NULL,
    date_range_mission daterange NOT NULL,
    imputation_value integer NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."Missions" OWNER TO postgres;

--
-- Name: Missions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Missions_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Missions_id_seq" OWNER TO postgres;

--
-- Name: Missions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Missions_id_seq" OWNED BY public."Missions".id;


--
-- Name: PRUs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."PRUs" (
    id integer NOT NULL,
    associate_id integer,
    start_date timestamp with time zone,
    end_date timestamp with time zone,
    value double precision,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."PRUs" OWNER TO postgres;

--
-- Name: PRUs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."PRUs_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."PRUs_id_seq" OWNER TO postgres;

--
-- Name: PRUs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."PRUs_id_seq" OWNED BY public."PRUs".id;


--
-- Name: Pdcs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Pdcs" (
    id integer NOT NULL,
    actual_year integer,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."Pdcs" OWNER TO postgres;

--
-- Name: Pdcs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Pdcs_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Pdcs_id_seq" OWNER TO postgres;

--
-- Name: Pdcs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Pdcs_id_seq" OWNED BY public."Pdcs".id;


--
-- Name: Projects; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Projects" (
    id integer NOT NULL,
    customer_id integer NOT NULL,
    adv character varying(255) NOT NULL,
    label character varying(255) NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."Projects" OWNER TO postgres;

--
-- Name: Projects_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Projects_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Projects_id_seq" OWNER TO postgres;

--
-- Name: Projects_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Projects_id_seq" OWNED BY public."Projects".id;


--
-- Name: TJMs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."TJMs" (
    id integer NOT NULL,
    mission_id integer,
    start_date date,
    end_date date,
    value double precision,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."TJMs" OWNER TO postgres;

--
-- Name: TJMs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."TJMs_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."TJMs_id_seq" OWNER TO postgres;

--
-- Name: TJMs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."TJMs_id_seq" OWNED BY public."TJMs".id;


--
-- Name: Timelines; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Timelines" (
    id integer NOT NULL,
    associate_id integer,
    date_range daterange NOT NULL,
    imputation_percentage integer,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."Timelines" OWNER TO postgres;

--
-- Name: Timelines_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Timelines_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Timelines_id_seq" OWNER TO postgres;

--
-- Name: Timelines_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Timelines_id_seq" OWNED BY public."Timelines".id;


--
-- Name: Accounts id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Accounts" ALTER COLUMN id SET DEFAULT nextval('public."Accounts_id_seq"'::regclass);


--
-- Name: Associates id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Associates" ALTER COLUMN id SET DEFAULT nextval('public."Associates_id_seq"'::regclass);


--
-- Name: Customers id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Customers" ALTER COLUMN id SET DEFAULT nextval('public."Customers_id_seq"'::regclass);


--
-- Name: Fees id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Fees" ALTER COLUMN id SET DEFAULT nextval('public."Fees_id_seq"'::regclass);


--
-- Name: Genders id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Genders" ALTER COLUMN id SET DEFAULT nextval('public."Genders_id_seq"'::regclass);


--
-- Name: Graduations id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Graduations" ALTER COLUMN id SET DEFAULT nextval('public."Graduations_id_seq"'::regclass);


--
-- Name: Jobs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Jobs" ALTER COLUMN id SET DEFAULT nextval('public."Jobs_id_seq"'::regclass);


--
-- Name: Missions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Missions" ALTER COLUMN id SET DEFAULT nextval('public."Missions_id_seq"'::regclass);


--
-- Name: PRUs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PRUs" ALTER COLUMN id SET DEFAULT nextval('public."PRUs_id_seq"'::regclass);


--
-- Name: Pdcs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Pdcs" ALTER COLUMN id SET DEFAULT nextval('public."Pdcs_id_seq"'::regclass);


--
-- Name: Projects id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Projects" ALTER COLUMN id SET DEFAULT nextval('public."Projects_id_seq"'::regclass);


--
-- Name: TJMs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."TJMs" ALTER COLUMN id SET DEFAULT nextval('public."TJMs_id_seq"'::regclass);


--
-- Name: Timelines id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Timelines" ALTER COLUMN id SET DEFAULT nextval('public."Timelines_id_seq"'::regclass);


--
-- Data for Name: Accounts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Accounts" (id, first_name, name, username, password, "createdAt", "updatedAt") FROM stdin;
1	Nicolas	Pettazzoni	root	$2b$05$dmkEvyNKZbBJaayL3Jo3puw3wVmkIvP1ON2wcIwLZwNl8aQ9wYLPq	2024-03-12 15:31:42.662+01	2024-03-12 15:31:42.662+01
\.


--
-- Data for Name: Associate_Jobs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Associate_Jobs" (associate_id, job_id, start_date, end_date, "createdAt", "updatedAt") FROM stdin;
1	1	2020-01-01 01:00:00+01	9999-12-31 23:59:59+01	2024-03-08 15:15:37.706+01	2024-03-08 15:15:37.706+01
2	2	2020-01-01 01:00:00+01	9999-12-31 23:59:59+01	2024-03-08 15:16:10.775+01	2024-03-08 15:16:10.775+01
\.


--
-- Data for Name: Associate_Managers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Associate_Managers" (associate_id, manager_id, start_date, end_date, "createdAt", "updatedAt") FROM stdin;
2	1	2020-01-01 01:00:00+01	9999-12-31 23:59:59+01	2024-03-08 15:16:10.782+01	2024-03-08 15:16:10.782+01
\.


--
-- Data for Name: Associates; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Associates" (id, name, first_name, birthdate, mail, graduation_id, gender_id, start_date, end_date, "createdAt", "updatedAt") FROM stdin;
1	Gourmel	Eric	1990-01-01	eric.gourmel@sii.fr	3	1	2020-01-01	\N	2024-03-08 15:15:37.696+01	2024-03-08 15:15:37.696+01
2	Poyeau	Tom	2000-01-01	tom.poyeau@sii.fr	3	1	2020-01-01	\N	2024-03-08 15:16:10.771+01	2024-03-08 15:16:10.771+01
\.


--
-- Data for Name: Customers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Customers" (id, label, "createdAt", "updatedAt") FROM stdin;
1	Covéa	2024-03-08 15:14:36.837+01	2024-03-08 15:14:36.837+01
\.


--
-- Data for Name: Fees; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Fees" (id, associate_id, mission_id, date, label, value, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Genders; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Genders" (id, label, "createdAt", "updatedAt") FROM stdin;
1	Homme	2024-03-08 15:13:48.155+01	2024-03-08 15:13:48.155+01
2	Femme	2024-03-08 15:13:53.675+01	2024-03-08 15:13:53.675+01
\.


--
-- Data for Name: Graduations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Graduations" (id, label, "createdAt", "updatedAt") FROM stdin;
1	Bac	2024-03-08 15:12:41.45+01	2024-03-08 15:12:41.45+01
2	License	2024-03-08 15:12:47.178+01	2024-03-08 15:12:47.178+01
3	Master	2024-03-08 15:12:58.555+01	2024-03-08 15:12:58.555+01
\.


--
-- Data for Name: Jobs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Jobs" (id, label, "createdAt", "updatedAt") FROM stdin;
1	Manager	2024-03-08 15:13:30.115+01	2024-03-08 15:13:30.115+01
2	Développeur	2024-03-08 15:13:42.054+01	2024-03-08 15:13:42.054+01
\.


--
-- Data for Name: Missions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Missions" (id, label, associate_id, project_id, date_range_mission, imputation_value, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: PRUs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."PRUs" (id, associate_id, start_date, end_date, value, "createdAt", "updatedAt") FROM stdin;
1	1	2020-01-01 01:00:00+01	9999-12-31 01:00:00+01	150	2024-03-08 15:15:37.713+01	2024-03-08 15:15:37.713+01
2	2	2020-01-01 01:00:00+01	9999-12-31 01:00:00+01	100	2024-03-08 15:16:10.778+01	2024-03-08 15:16:10.778+01
\.


--
-- Data for Name: Pdcs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Pdcs" (id, actual_year, "createdAt", "updatedAt") FROM stdin;
1	2023	2024-03-08 15:12:30.929+01	2024-03-08 15:12:30.929+01
\.


--
-- Data for Name: Projects; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Projects" (id, customer_id, adv, label, "createdAt", "updatedAt") FROM stdin;
1	1	1515	Test	2024-03-08 15:14:51.55+01	2024-03-08 15:14:51.55+01
\.


--
-- Data for Name: TJMs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."TJMs" (id, mission_id, start_date, end_date, value, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Timelines; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Timelines" (id, associate_id, date_range, imputation_percentage, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Name: Accounts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Accounts_id_seq"', 1, true);


--
-- Name: Associates_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Associates_id_seq"', 2, true);


--
-- Name: Customers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Customers_id_seq"', 1, true);


--
-- Name: Fees_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Fees_id_seq"', 1, false);


--
-- Name: Genders_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Genders_id_seq"', 2, true);


--
-- Name: Graduations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Graduations_id_seq"', 3, true);


--
-- Name: Jobs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Jobs_id_seq"', 2, true);


--
-- Name: Missions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Missions_id_seq"', 1, false);


--
-- Name: PRUs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."PRUs_id_seq"', 2, true);


--
-- Name: Pdcs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Pdcs_id_seq"', 1, true);


--
-- Name: Projects_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Projects_id_seq"', 1, true);


--
-- Name: TJMs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."TJMs_id_seq"', 1, false);


--
-- Name: Timelines_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Timelines_id_seq"', 1, false);


--
-- Name: Accounts Accounts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Accounts"
    ADD CONSTRAINT "Accounts_pkey" PRIMARY KEY (id);


--
-- Name: Associate_Jobs Associate_Jobs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Associate_Jobs"
    ADD CONSTRAINT "Associate_Jobs_pkey" PRIMARY KEY (associate_id, job_id);


--
-- Name: Associate_Managers Associate_Managers_associate_id_manager_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Associate_Managers"
    ADD CONSTRAINT "Associate_Managers_associate_id_manager_id_key" UNIQUE (associate_id, manager_id);


--
-- Name: Associate_Managers Associate_Managers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Associate_Managers"
    ADD CONSTRAINT "Associate_Managers_pkey" PRIMARY KEY (associate_id, manager_id, start_date);


--
-- Name: Associates Associates_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Associates"
    ADD CONSTRAINT "Associates_pkey" PRIMARY KEY (id);


--
-- Name: Customers Customers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Customers"
    ADD CONSTRAINT "Customers_pkey" PRIMARY KEY (id);


--
-- Name: Fees Fees_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Fees"
    ADD CONSTRAINT "Fees_pkey" PRIMARY KEY (id);


--
-- Name: Genders Genders_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Genders"
    ADD CONSTRAINT "Genders_pkey" PRIMARY KEY (id);


--
-- Name: Graduations Graduations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Graduations"
    ADD CONSTRAINT "Graduations_pkey" PRIMARY KEY (id);


--
-- Name: Jobs Jobs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Jobs"
    ADD CONSTRAINT "Jobs_pkey" PRIMARY KEY (id);


--
-- Name: Missions Missions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Missions"
    ADD CONSTRAINT "Missions_pkey" PRIMARY KEY (id);


--
-- Name: PRUs PRUs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PRUs"
    ADD CONSTRAINT "PRUs_pkey" PRIMARY KEY (id);


--
-- Name: Pdcs Pdcs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Pdcs"
    ADD CONSTRAINT "Pdcs_pkey" PRIMARY KEY (id);


--
-- Name: Projects Projects_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Projects"
    ADD CONSTRAINT "Projects_pkey" PRIMARY KEY (id);


--
-- Name: TJMs TJMs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."TJMs"
    ADD CONSTRAINT "TJMs_pkey" PRIMARY KEY (id);


--
-- Name: Timelines Timelines_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Timelines"
    ADD CONSTRAINT "Timelines_pkey" PRIMARY KEY (id);


--
-- Name: Associate_Jobs Associate_Jobs_associate_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Associate_Jobs"
    ADD CONSTRAINT "Associate_Jobs_associate_id_fkey" FOREIGN KEY (associate_id) REFERENCES public."Associates"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Associate_Jobs Associate_Jobs_job_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Associate_Jobs"
    ADD CONSTRAINT "Associate_Jobs_job_id_fkey" FOREIGN KEY (job_id) REFERENCES public."Jobs"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Associate_Managers Associate_Managers_associate_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Associate_Managers"
    ADD CONSTRAINT "Associate_Managers_associate_id_fkey" FOREIGN KEY (associate_id) REFERENCES public."Associates"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Associate_Managers Associate_Managers_manager_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Associate_Managers"
    ADD CONSTRAINT "Associate_Managers_manager_id_fkey" FOREIGN KEY (manager_id) REFERENCES public."Associates"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Associates Associates_gender_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Associates"
    ADD CONSTRAINT "Associates_gender_id_fkey" FOREIGN KEY (gender_id) REFERENCES public."Genders"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Associates Associates_graduation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Associates"
    ADD CONSTRAINT "Associates_graduation_id_fkey" FOREIGN KEY (graduation_id) REFERENCES public."Graduations"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Fees Fees_associate_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Fees"
    ADD CONSTRAINT "Fees_associate_id_fkey" FOREIGN KEY (associate_id) REFERENCES public."Associates"(id) ON UPDATE CASCADE;


--
-- Name: Fees Fees_mission_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Fees"
    ADD CONSTRAINT "Fees_mission_id_fkey" FOREIGN KEY (mission_id) REFERENCES public."Missions"(id) ON UPDATE CASCADE;


--
-- Name: Missions Missions_associate_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Missions"
    ADD CONSTRAINT "Missions_associate_id_fkey" FOREIGN KEY (associate_id) REFERENCES public."Associates"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Missions Missions_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Missions"
    ADD CONSTRAINT "Missions_project_id_fkey" FOREIGN KEY (project_id) REFERENCES public."Projects"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: PRUs PRUs_associate_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PRUs"
    ADD CONSTRAINT "PRUs_associate_id_fkey" FOREIGN KEY (associate_id) REFERENCES public."Associates"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Projects Projects_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Projects"
    ADD CONSTRAINT "Projects_customer_id_fkey" FOREIGN KEY (customer_id) REFERENCES public."Customers"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: TJMs TJMs_mission_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."TJMs"
    ADD CONSTRAINT "TJMs_mission_id_fkey" FOREIGN KEY (mission_id) REFERENCES public."Missions"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Timelines Timelines_associate_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Timelines"
    ADD CONSTRAINT "Timelines_associate_id_fkey" FOREIGN KEY (associate_id) REFERENCES public."Associates"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: postgres
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


--
-- PostgreSQL database dump complete
--

