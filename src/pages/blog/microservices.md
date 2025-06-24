---
layout: ../layouts/blog.astro
title: 'When Microservices are the Problem'
pubDate: 2025-06-12
description: 'A sample document for Microservice '
author: 'Mikey Sleevi'
image:
    url: 'https://docs.astro.build/assets/rose.webp'
    alt: 'The Astro logo on a dark background with a pink glow.'
tags: ["service-architecture", "microservices", "architectural-patterns"]
---

> Microservices are a pattern that allows the organization of services and interfaces to reflect the organization's hierarchy and structure

Architectural patterns are like opinions. Every one is at least a little wrong. A famous, and poorly understood, reflection of this idea is Fred Brooks' "No Silver Bullet" [1]. Along this line, Microservices are not a silver bullet. In fact, that architectural pattern provides more avenues for creating difficult problems than almost every other architectural pattern combined. And if used incorrectly, it addresses none of the problems you sought to address while adding additional problems. As a supposed "Rocket Surgeon" (As an aside, I am working to adjust this to "Oracle of Platforms" to reflect my new job responsibilities as of late), I love Microservice Architectures. The reason is, they solve a very specific people problem. Determining that people problem is left as an exercise for the reader. But I can assure you that this problem has existed in every company you have worked at that exceeded 20 engineers, and even some smaller than that. Outside of the people problem, the reason that I rather enjoy this pattern is that when executed even partially correctly, it gives space. This space can be used to re-evaluate ideas far more than other architectural patterns. And space is one of my favorite properties of high-functioning teams. A few weeks ago I posted a rather influential article titled "Efficiency is the Enemy" [2]. It highlights the importance of space and slack in your life and work. I encourage a reread or a first time read if you haven't already.

If we are going to have a meaningful conversation about when Microservices Architectures are valuable and when they are the problem, we need to talk first about what a "Microservice" is. I will start by talking about examples and counter-examples at Todyl today before diving into formal definitions.

**Examples:**

* alrtr 
* pdfservice
* grafana
* elasticsink
* enrich
* stasher

**Counter Examples:**

* GRC
* Bishop
* SGNAPI
* Thrust
* Ulysses, obviously

Every single one of the above is a great example of the bad, the ugly and the scary of "Microservices". We will talk about why each of these is a problem, but first let's discuss what a microservice actually is.

# Defining Microservices

A little while ago, Steve and I endeavored to define "Microservices" in a reasonable sense. It was referred to as "Mikey and Steve's 95 Theses". There are several bullet points from that I want to highlight.

* A data authority **must** have exactly one service
* All developers **must** publish a stub service that provides the minimum level of functionality and relies on exactly zero dependencies
* It **must** declare it's own build and test configuration

These bullet points are the primary pieces of what I had hoped that we would be building our future architectures on. These generally mean:

* All services have one database and all databases have one service
* All services are easy to mock and utilize in local testing
* All services can be configured to not just rely on local development.

Why are these so important though? Out of all the extensive number of things in that list, why would I select these for highlighting? Let's answer that by taking a bit of a detour through some foundational software principles. SOLID is a rather silly acronym. It's been floating around for quite some time. It came to fame in a time when we were building rather large services and we needed meaningful ways to talk about code architectures. I've long held that there is a priority order in SOLID [3], and that is:

1. Liskov Substitution Principle
2. Everything else.

Which is funny, because LSP is often the most ignored, because in practice it's the most difficult to implement. And it is as equally surprising as it is funny, because LSP is the only formal principle, everything else is subjective. Which brings me to why those points are so important: interfaces. 

Interfaces are the primary scalability lever in software. Enabling modifications while guaranteeing behavior through contracts via interfaces is the pinnacle of scaling software organizations. And interfaces are _everywhere_. They are your APIs, your UIs, your SQL, your log format, every in and out, every touch point is an interface whether you designed it that way or not. Which brings me to an increasingly relevant aphorism from Mikey's List of Software Aphorisms:

* *There will always be a section of consumers that misuses your interface*

Microservices must represent an interface. If you don't understand your interface, don't build a microservice. Build an interface that is isolated, one that is allows you to adjust the implementation without notifying or modifying your consumers. Which means to that end **microservices must also be independent**.

## The Problem with Minimum Viable Products

Todyl has a rather serious problem with reading and understanding. I stopped writing as much because the majority of people at Todyl read 30% of what I write and understand 20% of what they read. Even as I build tools and patterns, I find myself having to step in and actually police those patterns to ensure they are enforced. And we could make arguments that the patterns or writing isn't clear, and to be fair, every place I have ever worked has had some level of this. However, this company is the first where I have seen it to this degree. It's to the point where my writing needs to be checked by several people before it even gets distributed for fear of it being interpreted in a rather insane light. And I hope that gets your attention, it's there specifically to achieve that task. I think the reason for this is Todyl is incredibly bad at the Minimum Viable pattern.

I've become rather frustrated with TACO for this exact reason. TACO, as it stands today, has regressed from where it started at, and more importantly is nowhere near where it's supposed to be. People are wanting platforms faster, and as a result everything is taking much, much longer. When suggestions of direction are provided, they are often circumvented.  The systems being built are not being adhered to and instead of asking why or trying to guide the team, the only question seems to be when is the next platform or service being built. There is a common misconception that a MVP stands for Minimum Viable Product, it actually stands for **Maximum Value People (Can Deliver By Next Quarter)**. That's obviously a joke, but you get my point. An MVP should not be something where you bypass systems and patterns to deliver a feature faster, in fact, it's the opposite. An MVP is the minimum amount of feature you can deliver *while adhering to all of the systems and patterns in place*. If your question is "How can we do this faster?", the answer is sacrifice the functionality for something good that operates the minimum amount of feature possible, and then add more features on top of that.

## Microservices in Practice

Which brings us back to Microservices. I cannot be clearer about this: **Todyl is not doing Microservices in any way, shape or form. Every service being designed or talked about today is incorrect**. And it's not incorrect in a "Everything is a little wrong" way. It fundamentally violates major principles of architectural design and results in systems that are more brittle. I would rather every single person build everything in Ulysses than build yet **another** service that connects to the production database. I would even accept Thrust if it wasn't a massive security liability. Which should hopefully call to attention how serious I think this problem is. When Microservice Architectures are done poorly, things get worse for everyone.

### Microservices: The Bad

One of the examples of bad service design is making a system that is very hard to test locally. I will going into why this is so important in a bit, but a service that we have today that is very hard to test locally is alrtr. This is a service that I built, just so we know that I am not without fault. Let's pull an excerpt from the documentation that I wrote:

> Most of the test runs through a personal slack. If you would like to perform some integration testing, you should set up your own personal slack and run through the full install process. You will have to do some pythonic things in order to run the project. This includes:
>
> - Building a virtual environment (use `.venv`)
> - Activate the environment
> - Install the requirements

And for those that are interested the "full install process" involves setting up a PagerDuty account, a Slack account, and eventually a Jira account. Not exactly the easiest thing for someone to step into and starting hacking on. This is a hard service to test and therefore it becomes a very hard service to develop functionality for.

### Microservices: The Ugly

One common example at Todyl of an ugly service implementation is the "split brain" code. This is incredibly visible in Ulysses, but I am going to pick on SGN API. SGN API has some rather classic examples of problematic service design, but split brain code is the one I want to focus on. Let's look at an example:

```
	// Special mode //
	// When set by cmd line arg - perform Content Filtering Database optimization and exit.
	if *flagCfOptimizerRun {
		// TODO(konstantin): this is temporary job to clean up database from domain only classification with
		// trailing slash. Once it is executed at least once we need to remove it.
		log.Info("Running cache cleanup...")
		optimizer.CleanupRedisDB(context.Background(), redisClient)
		// end of temporary job //
		log.Info("Running Content Filtering Database optimizer...")
		start := time.Now()
		added, removed, err := optimizer.OptimizeRedisDB(context.Background(), redisClient)
		checkFatalError("OptimizeRedisDB failed", err)
		// Create cache DB and save its marshaled version into redis
		cache, err := optimizer.CreateDatabaseFromRedis(context.Background(), redisClient)
		checkFatalError("CreateDatabaseFromRedis failed", err)
		err = optimizer.SaveMarshaledDBIntoRedis(context.Background(), redisClient, cache.Marshal())
		checkFatalError("CreateDatabaseFromRedis failed", err)
		// Trigger running SGN API instance to reload marshaled DB from the redis.
		err = natsConn.Publish(common.ContentFilteringDatabaseReloadTopicName, nil)
		checkFatalError("NATS publish failed", err)
		log.Info("Content Filtering optimizer finished", "added_entries", added, "removed_entries", removed, "duration", time.Since(start))
		return
	}
```

What this tells me is that we actually have two services, the SGN API and the SGN API Content Filtering Database Optimization. This is one of the classic examples that arises from the inability to isolate data sources. SGN API has to do some "magic" in order to function better, so we wrote a service within a service. And now we have to maintain a special pattern for all of time.

### Microservices: The Scary

Now let's pick on the scariest service in development today: GRC. GRC is scary for several reasons, but the biggest is that it uses the current production database and has it's own new data stores. GRC is actually why this article started. An engineer, who may have made enough noise today to easily be identified, who has nothing to do with really any movements around architecture started complaining about "Microservices". Which was bizarre to me, because really none of this should have affected them at all. And then they explained...

GRC is bringing together all the problematic parts of Microservice development, which is:

* Not managing their own data sources
* Lacking configuration management
* Nonstandard tooling

Which is all culminating in the scariest thing possible: making local development more complex.

# The Most Important Thing in Software

I go through cycles of becoming a software developer then managing infrastructure then designing interfaces, and I was even a mobile developer for a spell. I am not one for classifications on my job, I will often find misbehaviors in software and fix them where ever they are most prevalent. As a result, I have been on more teams than I can count at this point. And I have noticed peculiar habits of every high performing team I have ever been on:

* Their time to production is measured on the order of minutes
* Their time to test a local change is measured on the order of seconds
* They interact with meaningful data locally

There are other habits, but these are often the most impactful and the only consistent ones. I have seen teams that were incredibly good at JIRA and meetings, and teams that literally put Post It Notes on a whiteboard that said something like "Fix Problem". Which is to say that maybe product and engineering management is meaningful sometimes, but I don't think it's the most important thing. The most important thing in software is **feedback time in the development cycle**. Everything you do should be to minimize the feedback time for a change. Increases to development feedback time always result in greater than linear decreases in productivity. 

# Looking Forward

I can't endorse the direction we are heading as a team. I think we value features with dubious value over the ability to maintain customers. I think we have a poor understanding of our value proposition for the next iteration of the company. I know we have no concept of what a platform actually is. And I sincerely hope we are early enough to head off this dragon before it gets too big. And most of that direction has been rather indirectly led through TACO, which brings me to my next point. I can't endorse the direction of TACO today. I would be wary of what we do next, because as it stands, everything will get much, much harder than it is today. Which brings me to my title change, which the keen observer may notice is more ominous than was originally implied at the beginning of this article.

Sincerely,

Oracle of Platforms

# References

1. https://worrydream.com/refs/Brooks_1986_-_No_Silver_Bullet.pdf
2. https://fs.blog/slack/
3. https://en.wikipedia.org/wiki/SOLID
