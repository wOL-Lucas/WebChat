const redirectToModule = (event, module) => {
    event.preventDefault();
    window.location.href = module;
};

export default redirectToModule;