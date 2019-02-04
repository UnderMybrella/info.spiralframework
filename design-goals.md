---
layout: generic
header: /images/handbook.png
---

# Design Goals
There are three main components to the Spiral Framework:
- A GUI (Graphical User Interface) component
- Two CLI (Command Line Interface) components
    - One of these is an interactive prompt-based interface
    - The other is a more traditional 'tool' that closer resembles scripts for shells.
    
This is on top of several behind-the-scenes modules that power the aforementioned interfaces:
- `spiral-base`, which provides utility and localisation support to all other modules
- `spiral-core`, which holds the primary functionality of all Spiral Framework interfaces
- `spiral-formats`, which is an independent module responsible for reading and writing formats pertaining to *Danganronpa*
- `spiral-media`, which is an integrated way to read and write several traditional media formats such as mp3, mp4, and ogg files
    - This component is not provided within `spiral-core` or any interface by default due to sheer dependency size (~100 MB). Instead, it is downloadable as a separate plugin.
- `spiral-osl`, which is a custom grammar to allow for easy scripts that support multiple *Danganronpa* versions.

These components allow a user to interface with all functionality that the Spiral Framework has to offer, in a manner that best suits their use case.

By offering three different ways to use the functionality we provide, the Spiral Framework gives users the tools they need to tackle the *Danganronpa* engines and create their own content.

This page sets out the goals for each different component to give maintainers, contributors, and interested parties an idea as to what each component is responsible for, where a feature should go, and what each component will ultimately provide.

<hr/>

## Spiral-Base
### Basic Utility
Dependencies:
- slf4j

Spiral-Base is the module responsible for everything else we have on the table. It serves as a dependency for all other modules, and provides the utilities they need.

Spiral-Base *should* provide:
- Localisation support
    - Functionality relating to localisation, such as changing languages
    - Utilities relating to localisation [^base-1]
- Base logging support
    - Spiral-Base defines slf4j as a dependency, which should be used for log output [^base-2]
- New classes that will be used by all modules
    - This includes things like InputStreams, OutputStreams, and type aliases in particular
        - This **only** applies to **global** type aliases - if something isn't needed by multiple modules, question whether it belongs in `base` or if it belongs somewhere else
    - This does **not** include formats, configuration files, proxies, etc
- Common utility functions, such as stream extensions
    - Once again, these should be functions and extensions that apply to many modules rather than a single one [^base-3]

Spiral-Base should *not* provide:
- Formats, or format-based utilities
    - These depend on spiral-formats, and thus should be included in spiral-formats [^base-4]
- Heavy dependencies
    - Things like json reading should be delegated to the end user interface; provide a delegate to read data from/with
- Circular dependencies
    - It's easy to create a problem where something *seems* like it should be in base, but depends on another spiral dependency. Include that 'thing' in the dependency, or something further down the tree!

<hr/>

## Spiral-Formats
### Danganronpa Formats
Dependencies:
- spiral-base

Spiral-Formats is where the heavy lifting starts to kick in. Spiral-Formats is responsible for encapsulating the logic required to read and write files for *Danganronpa*. 

Spiral-Formats *should* provide:
- A clean, safe, and consistent interface for working with files
    - Constructors should be made private, and access made possible via the use of operators and factory access methods [^impl]
    - Object construction **must** have some hard rule for whether the received object is valid or not
        - One such implementation may be to use null types; the object is 'null' when invalid, and can be checked and validated [^kt-impl]  [^nulls]
    - Most importantly, this access must be consistent across the module
        - Bonus points if the interface is intuitive or easy to understand!
    - Files should not be relegated to file system only; we should be capable of handling files from a variety of locations such as within another file, or over a network
        - An easy way to achieve this is via the use of a 'data source' - by having a function that returns a stream of data, you always get a fresh stream and can 'seek' if you so need [^kt-impl]
            - This has the downside, however, of 'double-writes'; if multiple formats need a single data source, but they need a file, a naïve implementation will write to disk multiple times
- Utilities and extensions to handle those files and formats
    - Easy accessors for 'unsafe' variants of formats, for instance [^nulls]
    - Builders for custom versions of formats
    - Any extensions to make working with difficult files and formats easier
        - Seriously. GMO files in particular are a mess

Spiral-Formats should *not* provide:
- 'General' formats, such as TGA, OGG, IVF, etc [^gangs-all-here]
- General utilities; those belong in `spiral-base` [^formats-general-util]
- 'User-Facing' friendly interfaces; those are handled in `spiral-core`
    - That being said, the interfaces should be usable without consulting *An Egg's Guide to Rocket Science*
    
<hr/>

## Spiral-Core
### The heart of the Spiral Framework
Dependencies:
- spiral-base
- spiral-formats
- spiral-osl
- jackson-core
- jackson-annotations
- jackson-databind
- jackson-datatype-jdk8
- jackson-datatype-jsr310
- jackson-module-kotlin
- jackson-module-parameter-names
- jackson-dataformat-yaml
- jackson-dataformat-xml
- twelvemonkeys:imageio-bmp
- twelvemonkeys:imageio-jpeg
- Karnage

Spiral-Core is where things really start to come together. This is the heart of our framework, the meat of our project. While Spiral-Formats set up for reading and writing our files, Spiral-Core implements that and more.

Spiral-Core *should* provide:
- A safe and easy-to-use interface for reading an abstract 'format'
    - In user implementations, we tend to work with very abstract files. We don't necessarily know that we're reading a *Wad* file up until the user tells us we are.
    - By defining a format structure, we get the advantage of being able to read and check multiple formats in sequence and compare them.
    - The format structure provides other necessities too, like coupling a read *and* write operation to one 'file type', but not always
- A system for storing configuration data as to prevent the user from having to re-enter important details time and time again
    - This should contain details like registered games, last action, open menus, concurrent operation limit, so on
    - This should be saved somewhere *universal*; no matter where I run the client from - and no matter which client - I should have the same values
    - We should also support some kind of system for temporary overrides; environmental variables?
- A system for installing plugins that modify a Spiral Framework instance in some fashion
    - This will be the system that power spiral-media as well as other projects, such as the DR-Randomiser
    - A plugin system allows for programs to modify a user's experience with *Spiral*, as well as leveraging access to the Spiral suite of tools
    - A 'default' repository maintained by 'official' Spiral Framework maintainers should be run, but support for external repositories should also be integrated
    - Regardless of repository, however, plugins **must** support some kind of signature
        - A plugin author must sign off on changes they make, and a repository maintainer must sign it too
        - This will be a bit of extra work for sure, but ensures that when an end user installs code, it has been verified by someone - ideally someone they trust.
        - Remember, end users will be running code that *they don't know themselves*. It is the responsibility of the end user for what code they run, yes, but by supporting signatures we can alleviate some of the pressure off of end users by sharing the burden with repository managers.
        - While a repository may choose to disable (or worse - automate) signatures, we can provide a warning in Spiral itself about this, but the verification system must be in place so that it *can* be used
        - A user should be able to proceed with installing an untrusted plugin (due to lack of signatures) but ***must not*** be able to proceed with installing a mismatched signature plugin. If they insist on installing it they can modify the JAR themselves to change the version.
    - Repositories should be searchable, but we should also provide a way to simply read from a flat file structure
        - JSON files are a good way to handle this, as well as directories
- A system for installing mods that modify a Danganronpa instance in some fashion
    - This is it - the core 'user experience' that Spiral is intended for
    - Mods should be able to be installed, and also uninstalled. The client should be able to save what files are being used by what mods, as well as save a backup of the original Danganronpa files when they are modified
    - Mods should be able to be browsed via repositories in a similar manner to plugins
    - Mods, however, are not required to be signed. While it is supported, it is not required.

Spiral-Core should *not* provide:
- Implementations for users to directly access or modify content
    - Spiral-Core serves *purely* as a model. Viewers or Controllers, such as a GUI or CLI, need to be their own project
- A sense of pride and accomplishment for developers
    - Make things *easy*. Out of spite.
- New format definitions
    - If you're ever thinking about putting in a new format, consider *why* it isn't in spiral-formats. See that module block for a better breakdown. [^gangs-all-here]
- Complex or unintuitive systems without sufficient documentation (and then some)
    - We're dealing with people's games here, at best. At worst, we're dealing with their *file system*
    - While every user *should* have a backup, *many won't*. For this reason - as well as a general responsibility and being a decent person - we maintain a moral liability to ensure the safety of our users [^ianal]
    - For this reason, we need to make sure our systems are easy, for both the end user and OURSELVES, to use.
    - While end users should never see the internals of spiral-core, we need to ensure that anyone making contributions, ***especially*** Brella, understand how to do what it is you're putting forth
    - Implementations should be as simple as possible. In cases where things might be a little bit complicated, *document it*. Ideally in the places it occurs, but also in the official documentation [^documentation]
    - There should, ideally, **never** be any ambiguity over what functions do, or how to use something. That won't ever be 100% the case, but that's the goal 
    
<hr/>

## Spiral-Media
### Integrated ffmpeg for easy conversions
Dependencies:
- spiral-base
- spiral-formats
- spiral-core
- humble-video-all

Spiral-Media is the 'solution' to an issue that was uncovered when dealing with audio and video formats; they are *very* complicated. While Spiral-Core will have the means to detect some basic formats, conversion will (still) rely on ffmpeg.

However, Spiral-Media solves the problem of users not having ffmpeg installed by allowing them to download a plugin that has it bundled! Perfect!

Spiral-Media *should* provide:
- A wrapper for an ffmpeg implementation bundled through humble-video
    - Honestly that's mostly it, it's pretty simple at it's core
- Utilities to easily support reading and writing of audio and video formats

Spiral-Media should *not* provide:
- A custom implementation of ffmpeg in Java. That's awful.

Spiral-Media *may* provide:
- Nuanced plugins for different architectures as to alleviate the download size

<hr/>

## Spiral-OSL
### Script the unscriptable
Dependencies:
- spiral-base
- spiral-formats
- parboiled-java

Lin and Wrd files are difficult to work with. They're obfuscated and compressed, and contain a lot of bloat and weird arguments. Spiral-OSL tries to change that.

By providing a custom grammar, we allow creators to write scripts using language that is familiar and easy to understand, allowing for "English-Like"[^osl-idiom] script structure. 

Spiral-OSL *should* provide:
- A nice, simple and fluent grammar
    - The 'language' should be simple enough that an unfamiliar creator can pick it up and understanding what's happening, yet powerful enough to be able to handle everything we need to throw at the game.
    - This will require abstraction of many underlying concepts and functions. Flag checks, for instance, are a nuisance by themselves, but by changing them to 'if' conditionals they make a lot more sense.
        - This will also mean that we should be providing multiple different ways of doing simple things. While an average user may find something like Lua's `if x then` [^osl-lua] syntax nicer to use, more "traditional" programmers will likely find `if(x)` much more comfortable to use.
    - We **must** provide aliases out of the box. They shouldn't be baked into the grammar itself, but they absolutely should be provided by header scripts.
        - This must include aliases for, at minimum: character names, game states, trial cameras. Ideally, we should provide aliases for: sprites, items, evidence.

Spiral-OSL should *not* provide:
- Baked-in aliases.
- Complicated grammar unless **absolutely** necessary
    - An extension of this - we should avoid long, run on statements that require lots of parameters. Use something akin to the builder pattern, maybe?
- A reliance on 'raw' op codes
    - If common scripts require statements like '0x33\|1, 0, 0, 1', we have failed.

Spiral-OSL *may* provide:
- Localisations of the grammar, to improve the experience for people that are more comfortable writing in another language.

<hr/>

## Spiral-Console
### CLIs are still relevant I swear!
Dependencies:
- spiral-base
- spiral-core
- spiral-formats
- spiral-osl
- Imperator
- logback-classic

There are a variety of reasons a user may choose to use a CLI to operate Spiral. Users may feel more comfortable with a command line, or the flexibility we offer with automation may appeal to developers in particular.

Regardless, we should attempt to appeal to a large demographic with spiral-console; driving the full force of the Spiral Framework through a command line interface.

Spiral-Console *should* provide:
- A proper help command, or some other form of  **built in** documentation
    - This was the major complaint with Spiral v2. A reliance on a poorly documented CLI
    - The [wiki](https://wiki.spiralframework.info) is a good start, but we shouldn't be depending on an external resource for documentation.
    - Guides may be delegated to the wiki, but ideally should be accessible from within[^cli-mediawiki-api]
    - The most important thing with all of this is users should have the documentation to be able to perform most tasks without requiring a browser, or some other external guide
        - Even beyond the usability of having to go back and forth, CLIs may be employed in headless environments, or other environments where searching would be equally arduous, and thus we should not be relying on them.
    - Documentation should happen *as* features are released, as it keeps the design within the head of the author, as well as preventing buildups
        - v2 ran into this issue; many features never got documentation simply because of the massive strain of having to document *all these features*.
        - Document early, and document accurately.
- Good error handling
    - Error handling should explain what's gone wrong, and explain how to fix the error (if possible)
        - This may or may not apply to incorrectly typed commands. Where possible, we should try and offer solutions, but it's not guaranteed
    - If we have a system or program error, **we need to tell the user.**
        - We inform the user of what's happened - that we broke, and how to report it
            - The message we give the user should not be a full stacktrace - it should be a condensed version of the message
        - This will be integrated into Jira
        - Censor Personally Identifiable Information
    - Ideally, we should handle errors semi-gracefully
        - If possible, poll our issue service and request further details
            - This may require a custom service but we will see
        - We should tell the user (if possible) what went wrong, and what steps can be taken to fix it (such as updating)
- Meaningful syntax for interfacing with spiral-core
    - We want to limit long-winded commands, but sometimes that can't be helped
        - Builder patterns, or optional parameters that prompt the user when absent, both help with this
    - Commands should **not** rely on the presence of colours or other ANSI prompts to be meaningful
        - Stuff like `\r` helps greatly, however don't rely on more precise cursor setting!
        - Windows versions prior to 10 won't have ANSI enabled most likely, and even then W10 may not have it accessible or enabled for every user
        - This applies for other properties too; don't rely on anything that isn't provided in core Java without significant testing!
            - VMs are gonna help with this
    - Take advantage of the fact that the user can try again! If they get part of the command wrong, maybe allow them to re enter it?
- The user a choice between different output styles
    - Tables look cool, but sometimes they stuff up. We shouldn't alienate people based on that
    - Tables, plain ASCII, ANSI; these are just three of what I imagine are numerous ways of styling text for output
    - Allow them to just, not write output, if that's what they want!
- Feature parity between the tool and interactive versions
    - This *does* require implementing every feature twice, but it'll be worth it I swear
- Feature parity with the GUI version

Spiral-Console should *not*:
- Lack **core** features that Spiral-Gui has, just because it's "easier" to implement them there
    - Pretty much the main exclusion to this is editor functions - these are highly impractical to include in a CLI
    - We're stubborn goddamnit. We *will* find a way to make these functions work! We didn't adopt the name 'Spiral' for nothing.
- Require "head-based" operations
    - Don't rely on things like file selectors, view-based progress bars, etc. Assume that the user is SSH'd into a shell, and doesn't have access to a desktop environment.
    - The user opted for the 'headless' version for a reason
- Add undocumented features
    - There is literally no reason for a feature to be undocumented (yes, this includes dev/debug features!)
    - If a feature makes it into release, it must be documented!
    
Spiral-Console *may* provide:
- "Head-Based" operations
    - File selectors are one good example of something that's not harmful to *offer*, but it shouldn't be a requirement.

<hr/>

## Spiral-Gui
### Ah! The future!

Spiral-Gui is going to be our "claim to fame". It's what most users will use, and it's what we will use for mod installers[^gui-installers-startup]. Thus, when implementing features, we should ensure that they are polished by the time they reach Spiral-Gui. 

This *will* result in a delay with feature parity, but it's for the best.

Spiral-Gui *should* provide:
- A proper help command, or some other form of  **built in** documentation
    - This was the major complaint with Spiral v2. A reliance on a poorly documented CLI
    - While we don't have a CLI in this case, we should still document *how* to do things. Things should be easy to understand!
    - The [wiki](https://wiki.spiralframework.info) is a good start, but we shouldn't be depending on an external resource for documentation.
    - Guides may be delegated to the wiki, but ideally should be accessible from within[^cli-mediawiki-api]
    - The most important thing with all of this is users should have the documentation to be able to perform most tasks without requiring a browser, or some other external guide
    - Documentation should happen *as* features are released, as it keeps the design within the head of the author, as well as preventing buildups
        - v2 ran into this issue; many features never got documentation simply because of the massive strain of having to document *all these features*.
        - Document early, and document accurately.
- Good error handling
    - Error handling should explain what's gone wrong, and explain how to fix the error (if possible)
        - This may or may not apply to incorrectly typed commands. Where possible, we should try and offer solutions, but it's not guaranteed
    - If we have a system or program error, **we need to tell the user.**
        - We inform the user of what's happened - that we broke, and how to report it
            - The message we give the user should not be a full stacktrace - it should be a condensed version of the message
        - This will be integrated into Jira
        - Censor Personally Identifiable Information
    - Ideally, we should handle errors semi-gracefully
        - If possible, poll our issue service and request further details
            - This may require a custom service but we will see
        - We should tell the user (if possible) what went wrong, and what steps can be taken to fix it (such as updating)
- Meaningful UX for interfacing with spiral-core
    - Try and organise good UIs that give users access to what they want soon
    - Do some research into accessibility for colours and the like
        - Implement macOS styling?
        - Regardless, **implement some kind of dark theme**
        - Literally the most important part of the app
    - Divide things into proper submenus. Take extra time to make it look ***good***.
        - While one could argue functionality > aesthetics, I would argue the opposite for Spiral-Gui. We need to focus on a proper UX before delving into features.
        - Lay the foundation and draw the plans before building the barn.
        - Users can't do anything if they don't know *how*. Focus on functionality for the CLI, but a positive UX for the Gui.
    - Keyboard shortcuts
- Feature parity with the console version

Spiral-Gui should *not*:
- Require "headless" operations
    - This includes debug printing to a console!!
    - Debug should be redirectable to a file, but also - most importantly - if we crash we should *show* the user with a popup!
    - Never assume there's a console attached
- Add undocumented features
    - There is literally no reason for a feature to be undocumented (yes, this includes dev/debug features!)
    - If a feature makes it into release, it must be documented!

<hr/>

[^impl]: This point is specific to an implementation, and is not indicative of all versions.
[^kt-impl]: This point is specific to the Kotlin implementation, and may not be observed by other implementations.
[^nulls]: Be wary when working with nulls! Languages without proper null safety can cause horrible errors if you don't take proper care.

[^base-1]: These utilities can be used project-wide, and serve no purpose being locked behind a module.
[^base-2]: We don't define an implementation until we get to a user facing program.
[^base-3]: There's nothing wrong with individual modules having their own classes, utility functions, etc. But it's important to consider the dependency tree - if it's used by, or could be used by, multiple dependencies, put it in base.
[^base-4]: Other examples exist within a similar vein.

[^gangs-all-here]: While a decent argument could be made that they belong purely out of a 'The Gang is all here' style, my viewpoint is that these belong in separate projects, or further down the tree in core. I'm always willing to hear other viewpoints though, and if enough people (unlikely) care I can move it.
[^formats-general-util]: A 'general utility' in this case is something that doesn't *depend* on something in spiral-formats

[^ianal]: Not a legal liability, no lawsuits please.
[^documentation]: Which is... somewhere. I'll get to that later.

[^osl-idiom]: Note that "English-Like" here is an idiom, rather than a literal statement. Localisation would be great to have, I'd just have to figure out *how*.

[^cli-mediawiki-api]: Mediawiki has an API, maybe we could automatically parse it? Alternatively, Jekyll + Mediawiki API + some way to render to ASCII? A few options on the table

[^gui-installers-startup]: This is a bit of a tough one, but we'll bundle Spiral-Gui for now, and potentially move to a dedicated system resource of some kind. Who knows what the future holds?