--
-- PostgreSQL database dump
--

\restrict htvxaH18rh1iDDmmBo2u2GwJ7NSQ4kPfe9Q519eLR8CT59SExKaKVemhCCmMHbk

-- Dumped from database version 16.14
-- Dumped by pg_dump version 16.14

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

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: cache; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cache (
    key character varying(255) NOT NULL,
    value text NOT NULL,
    expiration bigint NOT NULL
);


ALTER TABLE public.cache OWNER TO postgres;

--
-- Name: cache_locks; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cache_locks (
    key character varying(255) NOT NULL,
    owner character varying(255) NOT NULL,
    expiration bigint NOT NULL
);


ALTER TABLE public.cache_locks OWNER TO postgres;

--
-- Name: failed_jobs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.failed_jobs (
    id bigint NOT NULL,
    uuid character varying(255) NOT NULL,
    connection character varying(255) NOT NULL,
    queue character varying(255) NOT NULL,
    payload text NOT NULL,
    exception text NOT NULL,
    failed_at timestamp(0) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.failed_jobs OWNER TO postgres;

--
-- Name: failed_jobs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.failed_jobs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.failed_jobs_id_seq OWNER TO postgres;

--
-- Name: failed_jobs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.failed_jobs_id_seq OWNED BY public.failed_jobs.id;


--
-- Name: job_batches; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.job_batches (
    id character varying(255) NOT NULL,
    name character varying(255) NOT NULL,
    total_jobs integer NOT NULL,
    pending_jobs integer NOT NULL,
    failed_jobs integer NOT NULL,
    failed_job_ids text NOT NULL,
    options text,
    cancelled_at integer,
    created_at integer NOT NULL,
    finished_at integer
);


ALTER TABLE public.job_batches OWNER TO postgres;

--
-- Name: jobs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.jobs (
    id bigint NOT NULL,
    queue character varying(255) NOT NULL,
    payload text NOT NULL,
    attempts smallint NOT NULL,
    reserved_at integer,
    available_at integer NOT NULL,
    created_at integer NOT NULL
);


ALTER TABLE public.jobs OWNER TO postgres;

--
-- Name: jobs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.jobs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.jobs_id_seq OWNER TO postgres;

--
-- Name: jobs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.jobs_id_seq OWNED BY public.jobs.id;


--
-- Name: migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.migrations (
    id integer NOT NULL,
    migration character varying(255) NOT NULL,
    batch integer NOT NULL
);


ALTER TABLE public.migrations OWNER TO postgres;

--
-- Name: migrations_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.migrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.migrations_id_seq OWNER TO postgres;

--
-- Name: migrations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.migrations_id_seq OWNED BY public.migrations.id;


--
-- Name: password_reset_tokens; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.password_reset_tokens (
    email character varying(255) NOT NULL,
    token character varying(255) NOT NULL,
    created_at timestamp(0) without time zone
);


ALTER TABLE public.password_reset_tokens OWNER TO postgres;

--
-- Name: requests; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.requests (
    id bigint NOT NULL,
    user_id bigint NOT NULL,
    title character varying(255) NOT NULL,
    description text NOT NULL,
    status character varying(255) DEFAULT 'pending'::character varying NOT NULL,
    document_path character varying(255),
    signature_path character varying(255),
    signed_at timestamp(0) without time zone,
    date date,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    CONSTRAINT requests_status_check CHECK (((status)::text = ANY ((ARRAY['pending'::character varying, 'signed'::character varying, 'approved'::character varying, 'rejected'::character varying])::text[])))
);


ALTER TABLE public.requests OWNER TO postgres;

--
-- Name: requests_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.requests_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.requests_id_seq OWNER TO postgres;

--
-- Name: requests_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.requests_id_seq OWNED BY public.requests.id;


--
-- Name: sessions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sessions (
    id character varying(255) NOT NULL,
    user_id bigint,
    ip_address character varying(45),
    user_agent text,
    payload text NOT NULL,
    last_activity integer NOT NULL
);


ALTER TABLE public.sessions OWNER TO postgres;

--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id bigint NOT NULL,
    name character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    dni character varying(255) NOT NULL,
    status character varying(255) NOT NULL,
    role character varying(255) DEFAULT 'user'::character varying NOT NULL,
    password character varying(255) NOT NULL,
    remember_token character varying(100),
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    CONSTRAINT users_role_check CHECK (((role)::text = ANY ((ARRAY['user'::character varying, 'admin'::character varying])::text[]))),
    CONSTRAINT users_status_check CHECK (((status)::text = ANY ((ARRAY['active'::character varying, 'inactive'::character varying])::text[])))
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: failed_jobs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.failed_jobs ALTER COLUMN id SET DEFAULT nextval('public.failed_jobs_id_seq'::regclass);


--
-- Name: jobs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.jobs ALTER COLUMN id SET DEFAULT nextval('public.jobs_id_seq'::regclass);


--
-- Name: migrations id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.migrations ALTER COLUMN id SET DEFAULT nextval('public.migrations_id_seq'::regclass);


--
-- Name: requests id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.requests ALTER COLUMN id SET DEFAULT nextval('public.requests_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: cache; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cache (key, value, expiration) FROM stdin;
\.


--
-- Data for Name: cache_locks; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cache_locks (key, owner, expiration) FROM stdin;
\.


--
-- Data for Name: failed_jobs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.failed_jobs (id, uuid, connection, queue, payload, exception, failed_at) FROM stdin;
\.


--
-- Data for Name: job_batches; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.job_batches (id, name, total_jobs, pending_jobs, failed_jobs, failed_job_ids, options, cancelled_at, created_at, finished_at) FROM stdin;
\.


--
-- Data for Name: jobs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.jobs (id, queue, payload, attempts, reserved_at, available_at, created_at) FROM stdin;
\.


--
-- Data for Name: migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.migrations (id, migration, batch) FROM stdin;
1	0001_01_01_000000_create_users_table	1
2	0001_01_01_000001_create_cache_table	1
3	0001_01_01_000002_create_jobs_table	1
4	2026_06_22_123213_create_requests_table	1
\.


--
-- Data for Name: password_reset_tokens; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.password_reset_tokens (email, token, created_at) FROM stdin;
\.


--
-- Data for Name: requests; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.requests (id, user_id, title, description, status, document_path, signature_path, signed_at, date, created_at, updated_at) FROM stdin;
1	2	Suscipit unde vero architecto.	Illo non voluptatem veritatis suscipit. Facilis atque rem deleniti similique sed omnis. Nesciunt occaecati omnis enim culpa voluptatum beatae totam. Et est enim eos quam praesentium assumenda temporibus.	pending	\N	\N	\N	2026-06-22	2026-06-22 15:10:56	2026-06-22 15:10:56
2	2	Reprehenderit ullam asperiores nesciunt suscipit.	Voluptatem et dolores omnis exercitationem perferendis. Beatae eveniet officia sed. Numquam commodi architecto ducimus dolores. Nam sit blanditiis placeat libero dignissimos corrupti cumque.	pending	\N	\N	\N	2026-06-08	2026-06-22 15:10:56	2026-06-22 15:10:56
3	2	Consequuntur nam veritatis laudantium et enim.	Tenetur sunt qui reprehenderit omnis animi distinctio voluptates. Blanditiis itaque quidem accusantium debitis omnis quasi.	signed	\N	signatures/6a3950800a2164.01183547.png	2026-05-22 15:36:15	2026-07-05	2026-06-22 15:10:56	2026-06-22 15:10:56
4	2	Cum consequatur nobis aspernatur repudiandae accusantium.	Dolorem hic quo qui quod facilis. Voluptatem quos dolorem magni molestias. Odit ex culpa voluptatem minus itaque. Neque est et doloribus velit et sed.	approved	\N	signatures/6a3950800a5b11.97792931.png	2026-05-07 01:39:12	2026-07-05	2026-06-22 15:10:56	2026-06-22 15:10:56
5	2	Eos tempore voluptas recusandae.	Expedita vero assumenda dolor delectus dolor quis. Sed et in officia voluptatum distinctio sit. Nihil eius sed nisi molestias ut blanditiis rerum. Et pariatur illo nisi quo suscipit. Est ex quo ipsam quos.	rejected	\N	signatures/6a3950800a8654.20701547.png	2026-06-14 07:11:10	2026-05-24	2026-06-22 15:10:56	2026-06-22 15:10:56
6	2	Solicitud de software	Solicitud de licencia de software con documentación adjunta.	approved	requests/documents/solicitud-software-ejemplo.pdf	signatures/6a3950800aa7e4.32927096.png	2026-05-20 07:13:40	2026-06-27	2026-06-22 15:10:56	2026-06-22 15:10:56
7	3	Sint cupiditate sapiente porro et autem.	Ex distinctio totam rem ut ipsum neque. Sint eaque dolores quia vitae consequatur. Omnis asperiores eius eum.	pending	\N	\N	\N	2026-06-28	2026-06-22 15:10:56	2026-06-22 15:10:56
8	3	Reprehenderit error sit quaerat unde aut.	Unde quas aspernatur ea vel ea rerum laborum. Id laborum harum quia quisquam iste. Ipsa pariatur dolore velit suscipit laborum nisi eveniet. Eum perspiciatis incidunt occaecati est.	pending	\N	\N	\N	2026-07-07	2026-06-22 15:10:56	2026-06-22 15:10:56
9	3	Quasi soluta est ipsam cum.	Molestiae qui quis in est cum delectus. Sed minima dolor minima. Tempore qui dolorem nam voluptatibus nihil aut.	signed	\N	signatures/6a3950800b03b5.50826050.png	2026-06-09 10:50:56	2026-05-23	2026-06-22 15:10:56	2026-06-22 15:10:56
10	3	Repellat voluptate error consequatur deleniti.	Cum voluptatem voluptatibus natus et id. Illo perferendis unde autem ut earum repellendus ut amet. Et aperiam voluptates culpa veniam sit cumque earum. Suscipit quam iure autem ut.	approved	\N	signatures/6a3950800b2100.12297444.png	2026-05-12 03:17:35	2026-06-06	2026-06-22 15:10:56	2026-06-22 15:10:56
11	3	Blanditiis incidunt ad.	Debitis et iste et ut eius. Sed nisi sit odio nihil et. Corrupti cumque omnis quo repellat et ut ut.	rejected	\N	signatures/6a3950800b3f29.07682745.png	2026-05-15 01:29:21	2026-07-01	2026-06-22 15:10:56	2026-06-22 15:10:56
12	4	Incidunt id nesciunt consequatur aut.	Et vel sed at non. Beatae aliquid autem in vero pariatur. Fugiat est aut consequatur alias. Corrupti enim itaque voluptatum quo vero est voluptatem.	pending	\N	\N	\N	2026-07-10	2026-06-22 15:10:56	2026-06-22 15:10:56
13	4	Ipsa velit nobis quisquam inventore.	Ab perspiciatis sed laboriosam dolores sequi commodi et quo. Doloribus fuga ea qui quam est officia. Laborum labore adipisci explicabo nulla quisquam maiores.	pending	\N	\N	\N	2026-07-03	2026-06-22 15:10:56	2026-06-22 15:10:56
14	4	Aut aut excepturi repellat.	Vel voluptatibus ipsa nihil ut aut. Aut sint voluptatum voluptatem consectetur quam ut in. Sint sit odit quidem autem. Molestiae labore aut est.	signed	\N	signatures/6a3950800b94f0.70520348.png	2026-06-15 23:18:59	2026-06-07	2026-06-22 15:10:56	2026-06-22 15:10:56
15	4	Dolores non et.	Dolores enim corrupti nihil molestiae adipisci. Voluptas adipisci sint consequuntur aspernatur incidunt minima qui. Et eius aut sed laboriosam. Aut eum praesentium magnam quasi iste.	approved	\N	signatures/6a3950800bb1e4.82086794.png	2026-05-18 14:13:40	2026-06-28	2026-06-22 15:10:56	2026-06-22 15:10:56
16	4	Nihil id quod in.	Tempore laborum perspiciatis autem omnis non. Dolorum ut voluptatum facilis quae aperiam aliquid sit sint. In temporibus molestiae enim qui perferendis hic. Quia iste sit voluptatem officia dolorum harum.	rejected	\N	signatures/6a3950800bce44.84906557.png	2026-05-23 14:18:53	2026-06-09	2026-06-22 15:10:56	2026-06-22 15:10:56
17	5	Doloremque id quia ipsam voluptate.	Unde qui ipsum ut beatae est et suscipit. Voluptas dolor voluptas voluptatem repudiandae eos esse. Qui enim fugit nisi eum eaque fugit maiores.	pending	\N	\N	\N	2026-06-13	2026-06-22 15:10:56	2026-06-22 15:10:56
18	5	Rerum sed non voluptas adipisci.	Enim voluptatem quos eaque non. Officiis accusantium odit quia qui possimus numquam voluptatem. Molestiae libero ut rerum dignissimos dolorem. Totam consequatur aspernatur mollitia enim necessitatibus. Cumque distinctio natus beatae sunt debitis consequatur velit.	pending	\N	\N	\N	2026-07-21	2026-06-22 15:10:56	2026-06-22 15:10:56
19	5	Velit omnis molestias mollitia culpa excepturi.	Quidem exercitationem rerum mollitia incidunt. Quam deleniti et debitis aliquam quam. Voluptatem aut aspernatur atque aut et.	signed	\N	signatures/6a3950800c1b51.33018870.png	2026-06-05 15:05:46	2026-07-05	2026-06-22 15:10:56	2026-06-22 15:10:56
20	5	Sit sed dolorem fugit autem saepe.	Non et nihil asperiores commodi placeat in et. Fugit quis molestiae suscipit dolorem repellat assumenda. Nesciunt quia harum ipsa suscipit odit. Maxime sint voluptatem excepturi atque.	approved	\N	signatures/6a3950800c3623.33352695.png	2026-06-14 11:22:18	2026-06-04	2026-06-22 15:10:56	2026-06-22 15:10:56
21	5	Qui ea consequatur rem iure.	Cum assumenda nemo sapiente architecto. Qui consequuntur quod eum error facere non. In quia provident nam vero reprehenderit enim ducimus.	rejected	\N	signatures/6a3950800c5166.88860513.png	2026-05-01 11:31:50	2026-06-10	2026-06-22 15:10:56	2026-06-22 15:10:56
22	6	Consequatur ratione mollitia.	Sit vero doloribus magni sit laboriosam. Officiis aut perspiciatis omnis vitae. Eligendi consectetur maxime eveniet quam. Quaerat vel explicabo incidunt ad.	pending	\N	\N	\N	2026-05-23	2026-06-22 15:10:56	2026-06-22 15:10:56
23	6	Qui qui voluptatum.	Omnis cumque voluptatem occaecati enim nulla. Dolore vel consequatur ea nam exercitationem rerum et. Praesentium aliquid fuga id ullam laudantium.	pending	\N	\N	\N	2026-06-27	2026-06-22 15:10:56	2026-06-22 15:10:56
24	6	Sit quis enim.	Similique suscipit unde qui ex nesciunt. Explicabo id est facere modi repudiandae. Mollitia dolorem et qui facere aut suscipit sed. Delectus rem id vel eum ex mollitia qui similique. Cum voluptatum non neque deserunt recusandae.	signed	\N	signatures/6a3950800c9b95.35526608.png	2026-05-28 11:57:40	2026-06-09	2026-06-22 15:10:56	2026-06-22 15:10:56
25	6	Deserunt asperiores est et.	Aut enim et placeat voluptatem vel aliquid ut. Fuga et dolor hic porro voluptatem amet optio. Veniam ea et voluptatem ea ea inventore.	approved	\N	signatures/6a3950800cc6a3.12813880.png	2026-06-05 09:24:24	2026-07-03	2026-06-22 15:10:56	2026-06-22 15:10:56
26	6	Iure voluptatibus qui minima.	Officiis enim vero molestiae voluptatum. Excepturi dolorum enim mollitia fugit inventore cum doloribus. Aut reprehenderit perspiciatis fugiat perspiciatis. Error id laborum ut deserunt. Deserunt quis est quos dolores et.	rejected	\N	signatures/6a3950800ce8c1.79266784.png	2026-06-01 19:07:49	2026-06-28	2026-06-22 15:10:56	2026-06-22 15:10:56
27	7	Inventore saepe est ut.	Fugit soluta enim asperiores perferendis. Laudantium neque temporibus eaque beatae suscipit ut. Perferendis explicabo non aliquid omnis. Et laborum voluptatem fugiat hic qui quis.	pending	\N	\N	\N	2026-07-04	2026-06-22 15:10:56	2026-06-22 15:10:56
28	7	Quibusdam consectetur reiciendis est et officiis.	Aut officia eum amet. Placeat et itaque qui corrupti. Fuga quia corrupti et placeat labore voluptatem accusamus.	pending	\N	\N	\N	2026-07-05	2026-06-22 15:10:56	2026-06-22 15:10:56
29	7	Amet et tempora animi.	Eveniet corrupti deserunt a et perspiciatis et. Sunt quisquam itaque excepturi in laudantium dolor. Dolor veritatis aliquid voluptatem saepe error modi perspiciatis. Saepe dolor ad aut.	signed	\N	signatures/6a3950800d3560.12726923.png	2026-06-04 20:20:06	2026-07-02	2026-06-22 15:10:56	2026-06-22 15:10:56
30	7	Nesciunt optio ipsam.	Qui labore aliquid ea id qui. Earum maiores sed sit doloremque inventore. In ex amet quidem.	approved	\N	signatures/6a3950800d5267.25915846.png	2026-05-19 14:56:29	2026-06-05	2026-06-22 15:10:56	2026-06-22 15:10:56
31	7	Nemo consequatur velit.	Sunt iste ut nostrum. Quaerat doloremque dolores eos et. Est voluptas earum omnis porro. Dolorum molestiae quisquam molestias odit.	rejected	\N	signatures/6a3950800d70b6.02953160.png	2026-05-24 22:38:27	2026-06-18	2026-06-22 15:10:56	2026-06-22 15:10:56
\.


--
-- Data for Name: sessions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sessions (id, user_id, ip_address, user_agent, payload, last_activity) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, name, email, dni, status, role, password, remember_token, created_at, updated_at) FROM stdin;
1	Administrador	admin@portal.com	12345678A	active	admin	$2y$12$jNOstu9e.ZMYsMwknIWV6O/7Xa3nqQB5EagnAgtT7MxlAEOFP8bb6	W6RWeH4MlK	2026-06-22 15:10:55	2026-06-22 15:10:55
2	Usuario Demo	user@portal.com	11223344C	active	user	$2y$12$aYAaYr9/3P0E17I8vKaMxupuC7bWlHA0faDvC8EcJ6nm/dM8SXime	2qk63iPTcb	2026-06-22 15:10:56	2026-06-22 15:10:56
3	Ana Melgar	manuel21@example.org	89292968I	active	user	$2y$12$IxWnGvzYIQl6MomdH9TBwuHLETGK5R5CWPYLFd9/L9XKiaJJOL/HW	vF6Yh2db1I	2026-06-22 15:10:56	2026-06-22 15:10:56
4	Srta. Luisa Carretero Hijo	brito.sara@example.net	76037587L	active	user	$2y$12$IxWnGvzYIQl6MomdH9TBwuHLETGK5R5CWPYLFd9/L9XKiaJJOL/HW	8XDVyhR6Xj	2026-06-22 15:10:56	2026-06-22 15:10:56
5	Lic. Aurora Barragán Segundo	ruben.villalba@example.com	97297365F	active	user	$2y$12$IxWnGvzYIQl6MomdH9TBwuHLETGK5R5CWPYLFd9/L9XKiaJJOL/HW	dXkS31bWzI	2026-06-22 15:10:56	2026-06-22 15:10:56
6	Carla Cabello	quezada.nora@example.org	88469477K	active	user	$2y$12$IxWnGvzYIQl6MomdH9TBwuHLETGK5R5CWPYLFd9/L9XKiaJJOL/HW	4WCkE2h1Qt	2026-06-22 15:10:56	2026-06-22 15:10:56
7	Lic. Enrique Gaitán Segundo	leo40@example.com	95063359Y	active	user	$2y$12$IxWnGvzYIQl6MomdH9TBwuHLETGK5R5CWPYLFd9/L9XKiaJJOL/HW	X0fQbUwLIN	2026-06-22 15:10:56	2026-06-22 15:10:56
8	Usuario Inactivo	inactivo@portal.com	87654321B	inactive	user	$2y$12$IxWnGvzYIQl6MomdH9TBwuHLETGK5R5CWPYLFd9/L9XKiaJJOL/HW	igRQOTa2El	2026-06-22 15:10:56	2026-06-22 15:10:56
\.


--
-- Name: failed_jobs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.failed_jobs_id_seq', 1, false);


--
-- Name: jobs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.jobs_id_seq', 1, false);


--
-- Name: migrations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.migrations_id_seq', 4, true);


--
-- Name: requests_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.requests_id_seq', 31, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 8, true);


--
-- Name: cache_locks cache_locks_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cache_locks
    ADD CONSTRAINT cache_locks_pkey PRIMARY KEY (key);


--
-- Name: cache cache_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cache
    ADD CONSTRAINT cache_pkey PRIMARY KEY (key);


--
-- Name: failed_jobs failed_jobs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.failed_jobs
    ADD CONSTRAINT failed_jobs_pkey PRIMARY KEY (id);


--
-- Name: failed_jobs failed_jobs_uuid_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.failed_jobs
    ADD CONSTRAINT failed_jobs_uuid_unique UNIQUE (uuid);


--
-- Name: job_batches job_batches_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.job_batches
    ADD CONSTRAINT job_batches_pkey PRIMARY KEY (id);


--
-- Name: jobs jobs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.jobs
    ADD CONSTRAINT jobs_pkey PRIMARY KEY (id);


--
-- Name: migrations migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.migrations
    ADD CONSTRAINT migrations_pkey PRIMARY KEY (id);


--
-- Name: password_reset_tokens password_reset_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.password_reset_tokens
    ADD CONSTRAINT password_reset_tokens_pkey PRIMARY KEY (email);


--
-- Name: requests requests_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.requests
    ADD CONSTRAINT requests_pkey PRIMARY KEY (id);


--
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);


--
-- Name: users users_dni_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_dni_unique UNIQUE (dni);


--
-- Name: users users_email_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_unique UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: cache_expiration_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX cache_expiration_index ON public.cache USING btree (expiration);


--
-- Name: cache_locks_expiration_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX cache_locks_expiration_index ON public.cache_locks USING btree (expiration);


--
-- Name: failed_jobs_connection_queue_failed_at_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX failed_jobs_connection_queue_failed_at_index ON public.failed_jobs USING btree (connection, queue, failed_at);


--
-- Name: jobs_queue_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX jobs_queue_index ON public.jobs USING btree (queue);


--
-- Name: sessions_last_activity_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX sessions_last_activity_index ON public.sessions USING btree (last_activity);


--
-- Name: sessions_user_id_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX sessions_user_id_index ON public.sessions USING btree (user_id);


--
-- Name: requests requests_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.requests
    ADD CONSTRAINT requests_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict htvxaH18rh1iDDmmBo2u2GwJ7NSQ4kPfe9Q519eLR8CT59SExKaKVemhCCmMHbk

